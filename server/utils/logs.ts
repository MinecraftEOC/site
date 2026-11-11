import type { H3Event } from 'h3';
import type { FetchError } from 'ofetch';
import type { ZodSchema } from 'zod';
import type { ILogCategoriesResponse, ILogEntriesResponse, ILogFilesResponse } from '~~/shared/@types/response';
import type { TLogCategoriesQuery, TLogEntriesQuery, TLogFilesQuery } from '~~/shared/schemas/logging';

import { LOGS_DEFAULT_TIMEOUT_MS, LOGS_ERRORS, LOGS_NO_STORE_HEADER } from '~~/server/common/constants/logging';
import { ELogCombatAction } from '~~/shared/enums/logging';
import {
    sharedLogCategoriesResponseSchema,
    sharedLogEntriesResponseSchema,
    sharedLogFilesResponseSchema,
} from '~~/shared/schemas/logging';

/**
 * Проставляет заголовок `Cache-Control: private, no-store` на ответ админской ручки журналов.
 *
 * @param event Текущее событие H3.
 */
export function setLogsNoStoreHeader(event: H3Event): void {
    setResponseHeader(event, 'Cache-Control', LOGS_NO_STORE_HEADER);
}

/**
 * Определяет, нужно ли использовать локальные демонстрационные данные в dev-режиме.
 *
 * @returns `true`, если приложение запущено в dev-режиме и `NUXT_LOGS_API_BASE_URL` не задан.
 */
function shouldUseLocalMock(): boolean {
    const config = useRuntimeConfig();
    return Boolean(import.meta.dev && !String(config.logsApiBaseUrl ?? '').trim());
}

/**
 * Извлекает безопасное сообщение из тела ошибки `data-exchanger`.
 *
 * @param data Тело ответа с ошибкой от upstream.
 * @param fallback Текст по умолчанию.
 * @returns Безопасное сообщение на русском языке.
 */
function extractUpstreamMessage(data: unknown, fallback: string): string {
    if (data && typeof data === 'object' && 'detail' in data && typeof data.detail === 'string' && data.detail.trim()) {
        return data.detail.trim();
    }

    return fallback;
}

/**
 * Преобразует ошибку обращения к `data-exchanger` в безопасную HTTP-ошибку Nitro.
 *
 * @param error Перехваченная ошибка `$fetch`.
 * @throws HTTP-ошибка с безопасным статусом и русским сообщением.
 */
function rethrowLogsUpstreamError(error: unknown): never {
    const fetchErr = error as FetchError<{ detail?: string }>;
    const status = fetchErr?.response?.status ?? fetchErr?.statusCode;

    if (status === 400) {
        throw createError({
            statusCode: 400,
            message: extractUpstreamMessage(fetchErr.data, LOGS_ERRORS.BAD_REQUEST),
        });
    }

    if (status === 404) {
        throw createError({
            statusCode: 404,
            message: LOGS_ERRORS.FILE_NOT_FOUND,
        });
    }

    if (status === 409) {
        throw createError({
            statusCode: 409,
            message: extractUpstreamMessage(fetchErr.data, LOGS_ERRORS.FILE_MODIFIED),
        });
    }

    if (status === 429) {
        throw createError({
            statusCode: 429,
            message: LOGS_ERRORS.TOO_MANY_REQUESTS,
        });
    }

    if (status === 401 || status === 403) {
        throw createError({
            statusCode: 502,
            message: LOGS_ERRORS.UPSTREAM_AUTH_FAILED,
        });
    }

    if (status === 503) {
        throw createError({
            statusCode: 503,
            message: extractUpstreamMessage(fetchErr.data, LOGS_ERRORS.UPSTREAM_UNAVAILABLE),
        });
    }

    const causeName = (fetchErr as { name?: string; cause?: { name?: string } })?.name
        ?? (fetchErr as { cause?: { name?: string } })?.cause?.name;
    if (causeName === 'TimeoutError' || causeName === 'AbortError') {
        throw createError({
            statusCode: 504,
            message: LOGS_ERRORS.UPSTREAM_TIMEOUT,
        });
    }

    if (status && status >= 500) {
        throw createError({
            statusCode: 502,
            message: LOGS_ERRORS.UPSTREAM_UNAVAILABLE,
        });
    }

    throw createError({
        statusCode: 503,
        message: LOGS_ERRORS.UPSTREAM_UNAVAILABLE,
    });
}

/**
 * Выполняет защищённый запрос к фиксированному пути `data-exchanger` и проверяет ответ Zod-схемой.
 *
 * @param endpoint Фиксированный подпуть (`categories`, `files` или `entries`).
 * @param query Query-параметры запроса.
 * @param schema Zod-схема для проверки ответа.
 * @returns Провалидированный ответ источника журналов.
 * @throws `502`/`503`/`504` или прикладной код `400`/`404`/`409`/`429`.
 */
async function requestLogsUpstream<T>(
    endpoint: 'categories' | 'files' | 'entries',
    query: Record<string, string | number | boolean | undefined>,
    schema: ZodSchema<T>,
): Promise<T> {
    const config = useRuntimeConfig();
    const baseUrl = String(config.logsApiBaseUrl ?? '').trim().replace(/\/+$/, '');
    const token = String(config.logsApiToken ?? '').trim();
    const timeoutCandidate = Number(config.logsApiTimeoutMs);
    const timeoutMs = Number.isFinite(timeoutCandidate) && timeoutCandidate > 0
        ? timeoutCandidate
        : LOGS_DEFAULT_TIMEOUT_MS;

    if (!baseUrl || !token) {
        throw createError({
            statusCode: 503,
            message: LOGS_ERRORS.NOT_CONFIGURED,
        });
    }

    let rawData: unknown;
    try {
        rawData = await $fetch(`${baseUrl}/api/logs/${endpoint}`, {
            method: 'GET',
            query,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
            },
            timeout: timeoutMs,
            retry: 0,
            redirect: 'error',
        });
    } catch (error) {
        rethrowLogsUpstreamError(error);
    }

    const parsed = schema.safeParse(rawData);
    if (!parsed.success) {
        throw createError({
            statusCode: 502,
            message: LOGS_ERRORS.UPSTREAM_INVALID_RESPONSE,
        });
    }

    return parsed.data;
}

/**
 * Запрашивает список категорий серверных журналов.
 *
 * @param query Провалидированные параметры запроса категорий.
 * @returns Список всех известных категорий и их доступности.
 */
export async function fetchLogCategories(query: TLogCategoriesQuery): Promise<ILogCategoriesResponse> {
    if (shouldUseLocalMock()) {
        return getMockLogCategories(query);
    }

    return requestLogsUpstream(
        'categories',
        { refresh: query.refresh || undefined },
        sharedLogCategoriesResponseSchema,
    );
}

/**
 * Запрашивает список файлов `.log` выбранной категории.
 *
 * @param query Провалидированные параметры запроса списка файлов.
 * @returns Список файлов категории с метаданными и общим количеством.
 */
export async function fetchLogFiles(query: TLogFilesQuery): Promise<ILogFilesResponse> {
    if (shouldUseLocalMock()) {
        return getMockLogFiles(query);
    }

    return requestLogsUpstream(
        'files',
        {
            category: query.category,
            search: query.search,
            offset: query.offset,
            limit: query.limit,
            refresh: query.refresh || undefined,
        },
        sharedLogFilesResponseSchema,
    );
}

/**
 * Запрашивает порцию записей выбранного файла журнала.
 *
 * @param query Провалидированные параметры чтения и фильтрации записей.
 * @returns Порция записей с метаданными файла и курсором пагинации.
 */
export async function fetchLogEntries(query: TLogEntriesQuery): Promise<ILogEntriesResponse> {
    if (shouldUseLocalMock()) {
        return getMockLogEntries(query);
    }

    const response = await requestLogsUpstream(
        'entries',
        {
            category: query.category,
            file: query.file,
            limit: query.limit,
            order: query.order,
            cursor: query.cursor,
            level: query.level,
            q: query.q,
            event: query.event,
            checkType: query.checkType,
            outcome: query.outcome,
            action: query.action,
        },
        sharedLogEntriesResponseSchema,
    );

    if (!query.action) {
        return response;
    }

    return {
        ...response,
        items: response.items.filter((entry) => {
            if (!entry.event?.startsWith('combat.')) {
                return false;
            }

            if (query.action === ELogCombatAction.None) {
                return 'action' in entry.fields && entry.fields.action === null;
            }

            return typeof entry.fields.action === 'string'
                && entry.fields.action.trim().toLowerCase() === query.action;
        }),
    };
}
