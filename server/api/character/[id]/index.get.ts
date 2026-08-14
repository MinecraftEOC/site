import type { ICharacterResponse } from '~~/shared/@types/response';

import { CHARACTER_ERRORS, CHARACTER_PUBLIC_SELECT } from '~~/server/common/constants/character';

/**
 * `GET /api/character/:id` — персонаж по id для админской деталки.
 *
 * @throws 401 если запрос не авторизован.
 * @throws 403 если пользователь не администратор.
 * @throws 400 если id некорректен.
 * @throws 404 если персонаж не найден.
 */
export default defineEventHandler(async (event): Promise<ICharacterResponse> => {
    requireAdmin(event);

    const characterId = Number(getRouterParam(event, 'id'));

    if (!Number.isInteger(characterId)) {
        throw createError({ statusCode: 400, message: CHARACTER_ERRORS.EMPTY_ID });
    }

    const character = await prisma.character.findUnique({
        where: { id: characterId },
        select: CHARACTER_PUBLIC_SELECT,
    });

    if (!character) {
        throw createError({ statusCode: 404, message: CHARACTER_ERRORS.NOT_FOUND });
    }

    return toCharacterResponse(character);
});
