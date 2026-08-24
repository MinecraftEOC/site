import type { IContentItemResponse } from '~~/shared/@types/response';

import { CONTENT_ITEM_SELECT } from '~~/server/common/constants/content';
import { sharedContentListSchema } from '~~/shared/schemas/content';

/**
 * `GET /api/content/list` — карточки материалов без текста, свежие сверху.
 * Публичная: списки новостей и истории мира видны всем. Без параметра `type`
 * отдаются оба раздела — так их забирает таблица админки, без `take` —
 * раздел целиком.
 *
 * @throws 400 если указан несуществующий раздел или некорректен размер выборки.
 */
export default defineEventHandler(async (event): Promise<IContentItemResponse[]> => {
    const { type, take } = unwrapSafeParseOr400(await getValidatedQuery(event, sharedContentListSchema.safeParse));

    const entries = await prisma.contentEntry.findMany({
        where: { type },
        select: CONTENT_ITEM_SELECT,
        orderBy: { createdAt: 'desc' },
        take,
    });

    return entries.map(toContentResponse);
});
