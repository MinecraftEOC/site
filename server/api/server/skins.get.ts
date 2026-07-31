import { CHARACTER_ERRORS } from '~~/server/common/constants/character';

/**
 * `GET /api/server/skins` — скины персонажа по uuid для игрового сервера.
 * Внутренняя ручка, закрыта токеном в `server/middleware/server.ts`.
 *
 * @throws 403 если server-to-server токен отсутствует или неверен.
 */
export default defineEventHandler(async (event): Promise<string[]> => {
    const { uuid } = getQuery<{ uuid?: string }>(event);
    if (!uuid) {
        throw createError({ statusCode: 400, message: CHARACTER_ERRORS.EMPTY_UUID });
    }

    const skins = await prisma.skin.findMany({
        where: { character: { uuid } },
    });

    return skins.map(skin => skin.hash);
});
