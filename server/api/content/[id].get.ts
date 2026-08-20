import type { IContentAdminResponse } from '~~/shared/@types/response';

import { CONTENT_ADMIN_SELECT, CONTENT_ERRORS } from '~~/server/common/constants/content';

/**
 * `GET /api/content/:id` — материал по id вместе с исходным markdown. Только
 * для администратора: этой формой материал открывается на редактирование.
 *
 * @throws 401 если запрос не авторизован.
 * @throws 403 если пользователь не администратор.
 * @throws 400 если id некорректен.
 * @throws 404 если материал не найден.
 */
export default defineEventHandler(async (event): Promise<IContentAdminResponse> => {
    requireAdmin(event);

    const id = Number(getRouterParam(event, 'id'));
    if (!Number.isInteger(id)) {
        throw createError({ statusCode: 400, message: CONTENT_ERRORS.EMPTY_ID });
    }

    const entry = await prisma.contentEntry.findUnique({
        where: { id },
        select: CONTENT_ADMIN_SELECT,
    });

    if (!entry) {
        throw createError({ statusCode: 404, message: CONTENT_ERRORS.NOT_FOUND });
    }

    return toContentResponse(entry);
});
