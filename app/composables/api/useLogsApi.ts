import type {
    ILogCategoriesResponse,
    ILogEntriesResponse,
    ILogFilesResponse,
} from '~~/shared/@types/response';
import type {
    TLogCategoriesQuery,
    TLogEntriesQuery,
    TLogFilesQuery,
} from '~~/shared/schemas/logging';

const LOGS_BASE_PATH = '/api/admin/logs';

/**
 * Composable для обращения к админским ручкам чтения серверных журналов.
 *
 * @returns Методы запроса категорий, файлов и записей с поддержкой `AbortSignal`.
 */
export function useLogsApi() {
    const { $api } = useNuxtApp();

    return {
        getCategories: (query?: Partial<TLogCategoriesQuery>, signal?: AbortSignal) =>
            $api<ILogCategoriesResponse>(`${LOGS_BASE_PATH}/categories`, {
                query,
                signal,
                retry: 0,
            }),

        getFiles: (query: Partial<TLogFilesQuery> & Pick<TLogFilesQuery, 'category'>, signal?: AbortSignal) =>
            $api<ILogFilesResponse>(`${LOGS_BASE_PATH}/files`, {
                query,
                signal,
                retry: 0,
            }),

        getEntries: (
            query: Partial<TLogEntriesQuery> & Pick<TLogEntriesQuery, 'category' | 'file'>,
            signal?: AbortSignal,
        ) =>
            $api<ILogEntriesResponse>(`${LOGS_BASE_PATH}/entries`, {
                query,
                signal,
                retry: 0,
            }),
    };
}
