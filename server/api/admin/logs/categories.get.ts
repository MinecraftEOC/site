import type { ILogCategoriesResponse } from '~~/shared/@types/response';

import { sharedLogCategoriesQuerySchema } from '~~/shared/schemas/logging';

/**
 * `GET /api/admin/logs/categories` — список известных категорий серверных журналов
 * и признаков их доступности. Только для администратора.
 *
 * @throws 401 если запрос не авторизован.
 * @throws 403 если пользователь не администратор.
 * @throws 400 если параметры запроса некорректны.
 * @throws 502 если источник журналов вернул некорректный ответ или отклонил токен.
 * @throws 503 если источник журналов не настроен или недоступен.
 * @throws 504 если превышено время ожидания ответа источника журналов.
 */
export default defineEventHandler(async (event): Promise<ILogCategoriesResponse> => {
    setLogsNoStoreHeader(event);
    requireAdmin(event);

    const query = unwrapSafeParseOr400(await getValidatedQuery(event, sharedLogCategoriesQuerySchema.safeParse));

    return fetchLogCategories(query);
});
