import type { IContentAdminResponse } from '~~/shared/@types/response';

import { Prisma } from '~~/generated/prisma/client';
import { CONTENT_ADMIN_SELECT, CONTENT_ERRORS } from '~~/server/common/constants/content';
import { sharedContentUpdateSchema } from '~~/shared/schemas/content';

/**
 * `PATCH /api/content/:id` — правка материала (`multipart/form-data`, любое
 * подмножество полей). Картинка и текст меняются только вместе с новым файлом:
 * без него остаются прежними. Только для администратора.
 *
 * @throws 401 если запрос не авторизован.
 * @throws 403 если пользователь не администратор.
 * @throws 400 если id некорректен, нет изменений или файлы невалидны.
 * @throws 404 если материал не найден.
 * @throws 409 если слаг в этом разделе уже занят.
 */
export default defineEventHandler(async (event): Promise<IContentAdminResponse> => {
    requireAdmin(event);

    const id = Number(getRouterParam(event, 'id'));
    if (!Number.isInteger(id)) {
        throw createError({ statusCode: 400, message: CONTENT_ERRORS.EMPTY_ID });
    }

    const parts = await readMultipartFormData(event);
    const fields = parseContentFormOr400(parts, sharedContentUpdateSchema);
    const data: Prisma.ContentEntryUpdateInput = {};

    if (fields.type !== undefined) {
        data.type = fields.type;
    }

    if (fields.slug !== undefined) {
        data.slug = fields.slug;
    }

    if (fields.title !== undefined) {
        data.title = fields.title;
    }

    if (fields.description !== undefined) {
        data.description = fields.description || null;
    }

    const markdown = collectContentMarkdown(parts);
    if (markdown !== null) {
        Object.assign(data, prepareContentMarkdown(markdown));
    }

    const image = collectContentImage(parts);
    if (!image && Object.keys(data).length === 0) {
        throw createError({ statusCode: 400, message: CONTENT_ERRORS.NOTHING_TO_UPDATE });
    }

    const entry = await prisma.contentEntry.findUnique({
        where: { id },
        select: { image: true },
    });

    if (!entry) {
        throw createError({ statusCode: 404, message: CONTENT_ERRORS.NOT_FOUND });
    }

    const file = image ? await saveContentImage(image) : null;

    try {
        const updated = await prisma.contentEntry.update({
            where: { id },
            data: file ? { ...data, image: file } : data,
            select: CONTENT_ADMIN_SELECT,
        });

        if (file) {
            await deleteContentImage(entry.image);
        }

        return toContentResponse(updated);
    } catch (error) {
        if (file) {
            await deleteContentImage(file);
        }

        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            throw createError({ statusCode: 409, message: CONTENT_ERRORS.SLUG_TAKEN });
        }

        throw error;
    }
});
