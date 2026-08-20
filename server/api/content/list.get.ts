import type { IContentItemResponse } from '~~/shared/@types/response';

import { CONTENT_ITEM_SELECT } from '~~/server/common/constants/content';
import { sharedContentListSchema } from '~~/shared/schemas/content';

/**
 * `GET /api/content/list` — карточки материалов без текста, свежие сверху.
 * Публичная: списки новостей и истории мира видны всем. Без параметра `type`
 * отдаются оба раздела — так их забирает таблица админки.
 *
 * @throws 400 если указан несуществующий раздел.
 */
export default defineEventHandler(async (event): Promise<IContentItemResponse[]> => {
    const { type } = unwrapSafeParseOr400(await getValidatedQuery(event, sharedContentListSchema.safeParse));

    const entries = await prisma.contentEntry.findMany({
        where: { type },
        select: CONTENT_ITEM_SELECT,
        orderBy: { createdAt: 'desc' },
    });

    return entries.map(toContentResponse);
});
