import type { IContentAdminResponse } from '~~/shared/@types/response';

import { Prisma } from '~~/generated/prisma/client';
import { CONTENT_ADMIN_SELECT, CONTENT_ERRORS } from '~~/server/common/constants/content';
import { CONTENT_FORM_ERRORS, sharedContentSchema } from '~~/shared/schemas/content';

/**
 * `POST /api/content` — создание материала (`multipart/form-data`: поля,
 * картинка и `.md`-файл с текстом). Только для администратора.
 *
 * @throws 401 если запрос не авторизован.
 * @throws 403 если пользователь не администратор.
 * @throws 400 при некорректных полях, картинке или файле текста.
 * @throws 409 если слаг в этом разделе уже занят.
 */
export default defineEventHandler(async (event): Promise<IContentAdminResponse> => {
    requireAdmin(event);

    const parts = await readMultipartFormData(event);
    const fields = parseContentFormOr400(parts, sharedContentSchema);

    const image = collectContentImage(parts);
    if (!image) {
        throw createError({ statusCode: 400, message: CONTENT_FORM_ERRORS.IMAGE_REQUIRED });
    }

    const markdown = collectContentMarkdown(parts);
    if (markdown === null) {
        throw createError({ statusCode: 400, message: CONTENT_FORM_ERRORS.MARKDOWN_REQUIRED });
    }

    const { source, html } = prepareContentMarkdown(markdown);
    const file = await saveContentImage(image);

    try {
        const created = await prisma.contentEntry.create({
            data: {
                type: fields.type,
                slug: fields.slug,
                title: fields.title,
                description: fields.description || null,
                image: file,
                source,
                html,
            },
            select: CONTENT_ADMIN_SELECT,
        });

        return toContentResponse(created);
    } catch (error) {
        await deleteContentImage(file);

        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            throw createError({ statusCode: 409, message: CONTENT_ERRORS.SLUG_TAKEN });
        }

        throw error;
    }
});
