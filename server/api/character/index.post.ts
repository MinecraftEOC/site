import type { ICharacterResponse } from '~~/shared/@types/response';

import { randomUUID } from 'node:crypto';

import { Prisma } from '~~/generated/prisma/client';
import { CharacterStatus } from '~~/generated/prisma/enums';
import { CHARACTER_ERRORS, CHARACTER_PUBLIC_SELECT, USERNAME_REGEX } from '~~/server/common/constants/character';
import { SKIN_ERRORS, SKIN_MAX_COUNT } from '~~/server/common/constants/skin';
import { USER_ERRORS } from '~~/server/common/constants/user';

/**
 * `POST /api/character` — создание персонажа текущим пользователем.
 *
 * Принимает `multipart/form-data`: текстовые поля (`username`, `biography`,
 * `states`, `startingItems` — два последних как JSON-строки) и файлы скинов в
 * поле `skin` (0..N штук). Персонаж и его скины создаются атомарно (одна
 * транзакция + откат файлов при ошибке).
 *
 * У пользователя может быть только один «живой» персонаж: создать нового можно,
 * только если персонажей нет вовсе или текущий в статусе `DEAD`. Новый персонаж
 * получает статус `UNVERIFIED`. `uuid` генерируется на сайте, `password`
 * копируется из аккаунта пользователя.
 *
 * @throws 401 если запрос не авторизован.
 * @throws 400 при некорректных полях или невалидных файлах скинов.
 * @throws 404 если аккаунт пользователя не найден.
 * @throws 409 если уже есть активный персонаж, имя занято или превышен лимит скинов.
 */
export default defineEventHandler(async (event): Promise<ICharacterResponse> => {
    const { id: userId } = requireUser(event);
    const parts = await readMultipartFormData(event);

    const username = getFormField(parts, 'username')?.trim();
    if (!username || !USERNAME_REGEX.test(username)) {
        throw createError({ statusCode: 400, statusMessage: CHARACTER_ERRORS.INVALID_USERNAME });
    }

    const biography = getFormField(parts, 'biography')?.trim();
    if (!biography) {
        throw createError({ statusCode: 400, statusMessage: CHARACTER_ERRORS.EMPTY_BIOGRAPHY });
    }

    const states = parseJsonField(parts, 'states', CHARACTER_ERRORS.EMPTY_STATES, CHARACTER_ERRORS.INVALID_STATES);
    const startingItems = parseJsonField(parts, 'startingItems', CHARACTER_ERRORS.EMPTY_STARTING_ITEMS, CHARACTER_ERRORS.INVALID_STARTING_ITEMS);

    const skinBuffers = collectSkinFiles(parts);
    if (skinBuffers.length > SKIN_MAX_COUNT) {
        throw createError({ statusCode: 409, statusMessage: SKIN_ERRORS.LIMIT_REACHED });
    } else if (skinBuffers.length === 0) {
        throw createError({ statusCode: 400, statusMessage: SKIN_ERRORS.NO_SKINS });
    }

    const alive = await prisma.character.findFirst({
        where: { userId, status: { not: CharacterStatus.DEAD } },
        select: { id: true },
    });

    if (alive) {
        throw createError({ statusCode: 409, statusMessage: CHARACTER_ERRORS.ALREADY_EXISTS });
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { password: true },
    });

    if (!user) {
        throw createError({ statusCode: 404, statusMessage: USER_ERRORS.USER_NOT_FOUND });
    }

    const hashes = await saveSkinFiles(skinBuffers);

    try {
        return await prisma.character.create({
            data: {
                uuid: randomUUID(),
                username,
                password: user.password,
                biography,
                states,
                startingItems,
                userId,
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
 * Читает обязательное JSON-поле из multipart и парсит его.
 *
 * @param parts Части multipart-запроса.
 * @param name Имя поля.
 * @param emptyMessage Ошибка, если поле не передано.
 * @param invalidMessage Ошибка, если значение — не валидный JSON.
 * @returns Разобранное JSON-значение.
 * @throws `400` если поле отсутствует или содержит невалидный JSON.
 */
function parseJsonField(
    parts: Awaited<ReturnType<typeof readMultipartFormData>>,
    name: string,
    emptyMessage: string,
    invalidMessage: string,
): Prisma.InputJsonValue {
    const raw = getFormField(parts, name);
    if (raw === undefined) {
        throw createError({ statusCode: 400, statusMessage: emptyMessage });
    }

    try {
        return JSON.parse(raw);
    } catch {
        throw createError({ statusCode: 400, statusMessage: invalidMessage });
    }
}
