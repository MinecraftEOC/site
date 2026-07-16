import type { IServerSkinsResponse } from '~~/shared/@types/response';

import { CHARACTER_ERRORS } from '~~/server/common/constants/character';

/**
 * `GET /api/server/skins` — скины персонажа по uuid для игрового сервера.
 *
 * Ручка внутренняя: доступ закрыт server-to-server токеном на уровне middleware
 * (`server/middleware/server.ts`), сессия/роль не проверяются.
 *
 * @throws 403 если server-to-server токен отсутствует или неверен.
 */
export default defineEventHandler(async (event): Promise<IServerSkinsResponse> => {
    const { uuid } = getQuery<{ uuid?: string }>(event);
    if (!uuid) {
        throw createError({ statusCode: 400, statusMessage: CHARACTER_ERRORS.EMPTY_UUID });
    }

    const skins = await prisma.skin.findMany({
        where: { character: { uuid } },
    });

    return { hashes: skins.map(skin => skin.hash) };
});
