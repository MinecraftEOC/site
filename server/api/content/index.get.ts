import type { IContentResponse } from '~~/shared/@types/response';

import { CONTENT_ENTRY_SELECT, CONTENT_ERRORS } from '~~/server/common/constants/content';
import { sharedContentQuerySchema } from '~~/shared/schemas/content';

/**
 * `GET /api/content` — материал раздела по слагу вместе с разметкой текста.
 * Публичная: детальные страницы новостей и истории мира открыты всем.
 *
 * @throws 400 если раздел или слаг не переданы либо некорректны.
 * @throws 404 если материала с таким слагом в разделе нет.
 */
export default defineEventHandler(async (event): Promise<IContentResponse> => {
    const { type, slug } = unwrapSafeParseOr400(await getValidatedQuery(event, sharedContentQuerySchema.safeParse));

    const entry = await prisma.contentEntry.findUnique({
        where: { type_slug: { type, slug } },
        select: CONTENT_ENTRY_SELECT,
    });

    if (!entry) {
        throw createError({ statusCode: 404, message: CONTENT_ERRORS.NOT_FOUND });
    }

    return toContentResponse(entry);
});
