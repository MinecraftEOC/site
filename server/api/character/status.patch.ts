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
 * забанить → `BANNED` и т.п.). Опционально задаёт/очищает комментарий: поле не
 * передано — комментарий без изменений, пустая строка — очищается.
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
        throw createError({ statusCode: 400, statusMessage: CHARACTER_ERRORS.EMPTY_ID });
    }

    if (!body.status || !Object.values(CharacterStatus).includes(body.status)) {
        throw createError({ statusCode: 400, statusMessage: CHARACTER_ERRORS.INVALID_STATUS });
    }

    const character = await prisma.character.findUnique({
        where: { id: body.characterId },
        select: { id: true },
    });
    
    if (!character) {
        throw createError({ statusCode: 404, statusMessage: CHARACTER_ERRORS.NOT_FOUND });
    }

    const data: Prisma.CharacterUpdateInput = { status: body.status };

    if (body.comment !== undefined) {
        const trimmed = body.comment.trim();
        data.comment = trimmed.length > 0 ? trimmed : null;
    }

    return prisma.character.update({
        where: { id: character.id },
        data,
        select: CHARACTER_PUBLIC_SELECT,
    });
});
