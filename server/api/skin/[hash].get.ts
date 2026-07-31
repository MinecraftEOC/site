import { SKIN_ERRORS, SKIN_HASH_REGEX } from '~~/server/common/constants/skin';

/**
 * `GET /api/skin/:hash` — PNG-файл скина по хэшу. Публичная: картинки нужны
 * и браузеру, и игровому серверу.
 *
 * @throws 400 если хэш имеет недопустимый формат.
 * @throws 404 если файл скина не найден.
 */
export default defineEventHandler(async (event) => {
    const hash = getRouterParam(event, 'hash') ?? '';

    if (!SKIN_HASH_REGEX.test(hash)) {
        throw createError({ statusCode: 400, message: SKIN_ERRORS.SKIN_NOT_FOUND });
    }

    const file = await readSkinFile(hash);
    if (!file) {
        throw createError({ statusCode: 404, message: SKIN_ERRORS.SKIN_NOT_FOUND });
    }

    setHeader(event, 'Content-Type', 'image/png');
    setHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable');

    return file;
});
