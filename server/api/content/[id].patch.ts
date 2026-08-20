import type { IContentAdminResponse } from '~~/shared/@types/response';

import { Prisma } from '~~/generated/prisma/client';
import { CONTENT_ADMIN_SELECT, CONTENT_ERRORS } from '~~/server/common/constants/content';
import { CONTENT_GALLERY_MAX_COUNT } from '~~/shared/constants/content';
import { sharedContentUpdateSchema } from '~~/shared/schemas/content';

/**
 * `PATCH /api/content/:id` — правка материала (`multipart/form-data`, любое
 * подмножество полей). Обложка и текст меняются только вместе с новым файлом,
 * картинки текста добавляются загрузкой, а удаляются списком `removedImages`.
 * Разметка пересобирается всегда: набор картинок мог измениться. Только для
 * администратора.
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
    const gallery = collectContentGallery(parts);
    const removedImages = parseRemovedImages(parts);
    const image = collectContentImage(parts);

    const hasChanges = Object.keys(data).length > 0
        || markdown !== null
        || gallery.length > 0
        || removedImages.length > 0
        || Boolean(image);

    if (!hasChanges) {
        throw createError({ statusCode: 400, message: CONTENT_ERRORS.NOTHING_TO_UPDATE });
    }

    const entry = await prisma.contentEntry.findUnique({
        where: { id },
        select: {
            image: true,
            source: true,
            images: { select: { id: true, file: true, name: true } },
        },
    });

    if (!entry) {
        throw createError({ statusCode: 404, message: CONTENT_ERRORS.NOT_FOUND });
    }

    // Загруженная заново картинка заменяет прежнюю с тем же именем: иначе
    // ссылка в тексте стала бы неоднозначной, а обновить картинку было бы
    // нельзя без ручного удаления
    const replacedNames = new Set(gallery.map(item => item.name));

    const removed = entry.images.filter(item => removedImages.includes(item.id) || replacedNames.has(item.name));
    const kept = entry.images.filter(item => !removed.includes(item));

    if (kept.length + gallery.length > CONTENT_GALLERY_MAX_COUNT) {
        throw createError({ statusCode: 400, message: CONTENT_ERRORS.GALLERY_LIMIT });
    }

    const file = image ? await saveContentImage(image) : null;

    const saved = await saveContentGallery(gallery).catch(async (error) => {
        if (file) {
            await deleteContentImage(file);
        }

        throw error;
    });

    const source = markdown ?? entry.source;

    try {
        const updated = await prisma.contentEntry.update({
            where: { id },
            data: {
                ...data,
                ...(file ? { image: file } : {}),
                source,
                html: renderContentMarkdown(source, [...kept, ...saved]),
                images: {
                    deleteMany: { id: { in: removed.map(item => item.id) } },
                    create: saved,
                },
            },
            select: CONTENT_ADMIN_SELECT,
        });

        await deleteContentImages([...(file ? [entry.image] : []), ...removed.map(item => item.file)]);

        return toContentResponse(updated);
    } catch (error) {
        await deleteContentImages([...(file ? [file] : []), ...saved.map(item => item.file)]);

        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            throw createError({ statusCode: 409, message: CONTENT_ERRORS.SLUG_TAKEN });
        }

        throw error;
    }
});
