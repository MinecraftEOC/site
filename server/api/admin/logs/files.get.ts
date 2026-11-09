import type { ILogFilesResponse } from '~~/shared/@types/response';

import { sharedLogFilesQuerySchema } from '~~/shared/schemas/logging';

/**
 * `GET /api/admin/logs/files` — список файлов `.log` выбранной категории
 * с метаданными, сортировкой по дате изменения и поиском по имени или UUID боя.
 * Только для администратора.
 *
 * @throws 401 если запрос не авторизован.
 * @throws 403 если пользователь не администратор.
 * @throws 400 если указана неизвестная категория или некорректны параметры фильтрации.
 * @throws 502 если источник журналов вернул некорректный ответ или отклонил токен.
 * @throws 503 если источник журналов не настроен или недоступен.
 * @throws 504 если превышено время ожидания ответа источника журналов.
 */
export default defineEventHandler(async (event): Promise<ILogFilesResponse> => {
    setLogsNoStoreHeader(event);
    requireAdmin(event);

    const query = unwrapSafeParseOr400(await getValidatedQuery(event, sharedLogFilesQuerySchema.safeParse));

    return fetchLogFiles(query);
});
