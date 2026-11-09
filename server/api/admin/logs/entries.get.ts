import type { ILogEntriesResponse } from '~~/shared/@types/response';

import { sharedLogEntriesQuerySchema } from '~~/shared/schemas/logging';

/**
 * `GET /api/admin/logs/entries` — постраничное чтение и фильтрация записей
 * одного выбранного файла серверного журнала. Только для администратора.
 *
 * @throws 401 если запрос не авторизован.
 * @throws 403 если пользователь не администратор.
 * @throws 400 если указаны недопустимые категория, имя файла, фильтры или курсор.
 * @throws 404 если файл журнала не найден.
 * @throws 409 если файл журнала был перезаписан или усечён.
 * @throws 429 если превышен лимит одновременных чтений на источнике.
 * @throws 502 если источник журналов вернул некорректный ответ или отклонил токен.
 * @throws 503 если источник журналов не настроен или недоступен.
 * @throws 504 если превышено время ожидания ответа источника журналов.
 */
export default defineEventHandler(async (event): Promise<ILogEntriesResponse> => {
    setLogsNoStoreHeader(event);
    requireAdmin(event);

    const query = unwrapSafeParseOr400(await getValidatedQuery(event, sharedLogEntriesQuerySchema.safeParse));

    return fetchLogEntries(query);
});
