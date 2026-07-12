import type { ICharacterResponse } from '~~/shared/@types/response';

import { Prisma } from '~~/generated/prisma/client';
import { CharacterStatus } from '~~/generated/prisma/enums';
import {
    CHARACTER_EDITABLE_STATUSES,
    CHARACTER_ERRORS,
    CHARACTER_PUBLIC_SELECT,
    USERNAME_REGEX,
} from '~~/server/common/constants/character';
import { SKIN_ERRORS, SKIN_MAX_COUNT } from '~~/server/common/constants/skin';

/**
 * `PATCH /api/character` — доработка персонажа пользователем.
 *
 * Принимает `multipart/form-data`: любые из полей whitelist (`username`,
 * `biography`, `states`, `startingItems` — JSON-строки) и новые файлы скинов в
 * поле `skin`. Редактировать можно только собственного персонажа в статусе
 * `UNVERIFIED`/`RETURNED`. Новые скины добавляются к существующим (удаление —
 * отдельной ручкой). После сохранения статус сбрасывается в `UNVERIFIED`, а
 * комментарий администратора очищается — персонаж снова уходит на модерацию.
 *
 * @throws 401 если запрос не авторизован.
 * @throws 400 если не передано ни одного изменения или поля некорректны.
 * @throws 404 если нет персонажа, доступного для редактирования.
 * @throws 409 если имя занято или превышен лимит скинов.
 */
export default defineEventHandler(async (event): Promise<ICharacterResponse> => {
    const { id: userId } = requireUser(event);
    const parts = await readMultipartFormData(event);
    const data: Prisma.CharacterUpdateInput = {};

    const username = getFormField(parts, 'username');
    if (username !== undefined) {
        const trimmed = username.trim();
        if (!USERNAME_REGEX.test(trimmed)) {
            throw createError({ statusCode: 400, statusMessage: CHARACTER_ERRORS.INVALID_USERNAME });
        }
        data.username = trimmed;
    }

    const biography = getFormField(parts, 'biography');
    if (biography !== undefined) {
        const trimmed = biography.trim();
        if (!trimmed) {
            throw createError({ statusCode: 400, statusMessage: CHARACTER_ERRORS.EMPTY_BIOGRAPHY });
        }
        data.biography = trimmed;
    }

    const states = getFormField(parts, 'states');
    if (states !== undefined) {
        data.states = parseJson(states, CHARACTER_ERRORS.INVALID_STATES);
    }

    const startingItems = getFormField(parts, 'startingItems');
    if (startingItems !== undefined) {
        data.startingItems = parseJson(startingItems, CHARACTER_ERRORS.INVALID_STARTING_ITEMS);
    }

    // Валидируем новые файлы скинов до любых записей.
    const skinBuffers = collectSkinFiles(parts);

    // Должно быть хоть одно изменение: поле или новый скин.
    if (Object.keys(data).length === 0 && skinBuffers.length === 0) {
        throw createError({ statusCode: 400, statusMessage: CHARACTER_ERRORS.NOTHING_TO_UPDATE });
    }

    // Доработке подлежит только свой персонаж в редактируемом статусе.
    const character = await prisma.character.findFirst({
        where: { userId, status: { in: CHARACTER_EDITABLE_STATUSES } },
        select: { id: true, _count: { select: { skins: true } } },
    });
    if (!character) {
        throw createError({ statusCode: 404, statusMessage: CHARACTER_ERRORS.NOT_EDITABLE });
    }

    if (character._count.skins + skinBuffers.length > SKIN_MAX_COUNT) {
        throw createError({ statusCode: 409, statusMessage: SKIN_ERRORS.LIMIT_REACHED });
    }

    // Правка возвращает персонажа на модерацию и снимает старый комментарий.
    data.status = CharacterStatus.UNVERIFIED;
    data.comment = null;

    const hashes = await saveSkinFiles(skinBuffers);

    try {
        return await prisma.character.update({
            where: { id: character.id },
            data: {
                ...data,
                skins: { create: hashes.map(hash => ({ hash })) },
            },
            select: CHARACTER_PUBLIC_SELECT,
        });
    } catch (error) {
        await deleteSkinFiles(hashes);
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            throw createError({ statusCode: 409, statusMessage: CHARACTER_ERRORS.USERNAME_TAKEN });
        }
        throw error;
    }
});

/**
 * Парсит JSON-строку поля формы.
 *
 * @param raw Сырое значение поля.
 * @param invalidMessage Ошибка, если значение — не валидный JSON.
 * @returns Разобранное JSON-значение.
 * @throws `400` если значение содержит невалидный JSON.
 */
function parseJson(raw: string, invalidMessage: string): Prisma.InputJsonValue {
    try {
        return JSON.parse(raw);
    } catch {
        throw createError({ statusCode: 400, statusMessage: invalidMessage });
    }
}
