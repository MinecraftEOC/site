import type { ISuccessResponse } from '~~/shared/@types/response';

import { CONTENT_ERRORS } from '~~/server/common/constants/content';

/**
 * `DELETE /api/content/:id` — удаление материала вместе с его картинкой.
 * Только для администратора.
 *
 * @throws 401 если запрос не авторизован.
 * @throws 403 если пользователь не администратор.
 * @throws 400 если id некорректен.
 * @throws 404 если материал не найден.
 */
export default defineEventHandler(async (event): Promise<ISuccessResponse> => {
    requireAdmin(event);

    const id = Number(getRouterParam(event, 'id'));
    if (!Number.isInteger(id)) {
        throw createError({ statusCode: 400, message: CONTENT_ERRORS.EMPTY_ID });
    }

    const entry = await prisma.contentEntry.findUnique({
        where: { id },
        select: {
            image: true,
            images: { select: { file: true } },
        },
    });

    if (!entry) {
        throw createError({ statusCode: 404, message: CONTENT_ERRORS.NOT_FOUND });
    }

    await prisma.contentEntry.delete({ where: { id } });
    await deleteContentImages([entry.image, ...entry.images.map(item => item.file)]);

    return { success: true };
});
