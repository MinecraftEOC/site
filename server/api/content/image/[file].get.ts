import { CONTENT_ERRORS, CONTENT_IMAGE_FILE_REGEX, CONTENT_IMAGE_FORMATS } from '~~/server/common/constants/content';

/**
 * `GET /api/content/image/:file` — картинка материала по имени файла.
 * Публичная: обложки нужны и в списках, и на детальных страницах.
 *
 * @throws 400 если имя файла имеет недопустимый формат.
 * @throws 404 если файл картинки не найден.
 */
export default defineEventHandler(async (event) => {
    const name = getRouterParam(event, 'file') ?? '';
    const format = CONTENT_IMAGE_FORMATS.find(item => name.endsWith(`.${item.extension}`));

    if (!format || !CONTENT_IMAGE_FILE_REGEX.test(name)) {
        throw createError({ statusCode: 400, message: CONTENT_ERRORS.IMAGE_NOT_FOUND });
    }

    const file = await readContentImage(name);
    if (!file) {
        throw createError({ statusCode: 404, message: CONTENT_ERRORS.IMAGE_NOT_FOUND });
    }

    setHeader(event, 'Content-Type', format.contentType);
    setHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable');

    return file;
});
