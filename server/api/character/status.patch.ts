import type { Prisma } from '~~/generated/prisma/client';
import type { IUpdateCharacterStatusBody } from '~~/server/common/@types/character';
import type { ICharacterResponse } from '~~/shared/@types/response';

import { CharacterStatus } from '~~/generated/prisma/enums';
import { CHARACTER_ERRORS, CHARACTER_PUBLIC_SELECT } from '~~/server/common/constants/character';

/**
 * `PATCH /api/character/status` — установка статуса персонажа администратором.
 *
 * Доступно только админу (`requireAdmin`). Позволяет выставить **любой** статус
 * из `CharacterStatus` (одобрить → `ACTIVE`, вернуть на доработку → `RETURNED`,
 * забанить → `BANNED`, снять с игры → `UNAVAILABLE` и т.п.). Вместе со статусом
 * можно задать/очистить комментарий к статусу (`statusComment`) и комментарий
 * модерации (`reviewComment`): поле не передано — без изменений, пустая
 * строка — очищается.
 *
 * `statusChangedAt` обновляется, только если статус реально сменился: правка
 * одних комментариев дату не двигает.
 *
 * @throws 401 если запрос не авторизован.
 * @throws 403 если пользователь не администратор.
 * @throws 400 если не передан id или статус некорректен.
 * @throws 404 если персонаж не найден.
 */
export default defineEventHandler(async (event): Promise<ICharacterResponse> => {
    requireAdmin(event);

    const body = await readBody<IUpdateCharacterStatusBody>(event);

    if (!Number.isInteger(body.characterId)) {
        throw createError({ statusCode: 400, message: CHARACTER_ERRORS.EMPTY_ID });
    }

    if (!body.status || !Object.values(CharacterStatus).includes(body.status)) {
        throw createError({ statusCode: 400, message: CHARACTER_ERRORS.INVALID_STATUS });
    }

    const character = await prisma.character.findUnique({
        where: { id: body.characterId },
        select: { id: true, status: true },
    });

    if (!character) {
        throw createError({ statusCode: 404, message: CHARACTER_ERRORS.NOT_FOUND });
    }

    const data: Prisma.CharacterUpdateInput = { status: body.status };

    if (character.status !== body.status) {
        data.statusChangedAt = new Date();
    }

    if (body.statusComment !== undefined) {
        data.statusComment = normalizeComment(body.statusComment);
    }

    if (body.reviewComment !== undefined) {
        data.reviewComment = normalizeComment(body.reviewComment);
    }

    const updated = await prisma.character.update({
        where: { id: character.id },
        data,
        select: CHARACTER_PUBLIC_SELECT,
    });

    return toCharacterResponse(updated);
});

/**
 * Готовит присланный комментарий к записи: обрезает пробелы, пустую строку
 * трактует как очистку поля.
 *
 * @param raw Значение комментария из тела запроса.
 * @returns Текст комментария или `null`, если он пустой.
 */
function normalizeComment(raw: string): string | null {
    const trimmed = raw.trim();
    return trimmed.length > 0 ? trimmed : null;
}
