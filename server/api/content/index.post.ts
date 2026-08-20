import type { IContentAdminResponse } from '~~/shared/@types/response';

import { Prisma } from '~~/generated/prisma/client';
import { CONTENT_ADMIN_SELECT, CONTENT_ERRORS } from '~~/server/common/constants/content';
import { CONTENT_GALLERY_MAX_COUNT } from '~~/shared/constants/content';
import { CONTENT_FORM_ERRORS, sharedContentSchema } from '~~/shared/schemas/content';

/**
 * `POST /api/content` — создание материала (`multipart/form-data`: поля,
 * картинка, `.md`-файл с текстом и картинки для текста). Только для
 * администратора.
 *
 * @throws 401 если запрос не авторизован.
 * @throws 403 если пользователь не администратор.
 * @throws 400 при некорректных полях, картинках или файле текста.
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

    const gallery = collectContentGallery(parts);
    if (gallery.length > CONTENT_GALLERY_MAX_COUNT) {
        throw createError({ statusCode: 400, message: CONTENT_ERRORS.GALLERY_LIMIT });
    }

    const file = await saveContentImage(image);
    const images = await saveContentGallery(gallery).catch(async (error) => {
        await deleteContentImage(file);
        throw error;
    });

    try {
        const created = await prisma.contentEntry.create({
            data: {
                type: fields.type,
                slug: fields.slug,
                title: fields.title,
                description: fields.description || null,
                image: file,
                source: markdown,
                html: renderContentMarkdown(markdown, images),
                images: { create: images },
            },
            select: CONTENT_ADMIN_SELECT,
        });

        return toContentResponse(created);
    } catch (error) {
        await deleteContentImages([file, ...images.map(item => item.file)]);

        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            throw createError({ statusCode: 409, message: CONTENT_ERRORS.SLUG_TAKEN });
        }

        throw error;
    }
});
