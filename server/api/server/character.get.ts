import type { IServerCharacterResponse } from '~~/shared/@types/response';

import { ERROR_STATUSES } from '~~/server/common/constants/auth';

/**
 * `GET /api/server/character` — данные персонажа по uuid для игрового сервера.
 *
 * Ручка внутренняя: доступ закрыт server-to-server токеном на уровне middleware
 * (`server/middleware/server.ts`), сессия/роль не проверяются.
 *
 * @throws 403 если server-to-server токен отсутствует или неверен.
 * @throws 404 если персонаж с таким uuid не найден.
 */
export default defineEventHandler(async (event): Promise<IServerCharacterResponse> => {
    const { uuid } = getQuery<{ uuid?: string }>(event);
    if (!uuid) {
        throw createError({ statusCode: 400, statusMessage: ERROR_STATUSES.EMPTY_UUID });
    }

    const character = await prisma.character.findUnique({
        where: { uuid },
        select: {
            uuid: true,
            username: true,
            states: true,
            startingItems: true,
        },
    });

    if (!character) {
        throw createError({ statusCode: 404, statusMessage: ERROR_STATUSES.CHARACTER_NOT_FOUND });
    }

    return character;
});
