import type { H3Event } from 'h3';

import { z } from 'zod';

import { globalSessionSchema } from '~~/shared/schemas/session-control';

const GLOBAL_SESSION_PATH = '/world/mappet/eoc/global.json';
const SERVER_PROPERTIES_PATH = '/server.properties';
const SERVER_ID_PATTERN = /^[a-z0-9]{8}$/i;
const WHITELIST_PROPERTY_PATTERN = /^white-list\s*[=:](.*)$/;

const resourcesSchema = z.object({
    attributes: z.object({
        current_state: z.enum(['offline', 'starting', 'running', 'stopping']),
        resources: z.object({ uptime: z.number().nonnegative() }),
    }),
});

/**
 * Проверяет, что URL панели указывает на HTTP(S)-адрес без дополнительных частей.
 *
 * @param value Адрес панели из окружения.
 * @returns Проверенный URL или `null`, если адрес непригоден.
 */
function parsePanelOrigin(value: string): URL | null {
    if (!URL.canParse(value)) {
        return null;
    }

    const url = new URL(value);
    const hasHttpProtocol = url.protocol === 'https:' || url.protocol === 'http:';
    const isBareOrigin = url.pathname === '/' && !url.search && !url.hash;
    const hasUserInfo = url.username || url.password;

    return hasHttpProtocol && isBareOrigin && !hasUserInfo ? url : null;
}

/**
 * Создаёт клиент Pterodactyl для игрового сервера из приватной конфигурации сайта.
 *
 * @param event Событие Nitro для чтения окружения.
 * @throws 503 если параметры подключения некорректны.
 */
export function createPterodactylClient(event: H3Event) {
    const config = useRuntimeConfig(event);
    const { pterodactylBaseUrl, pterodactylApiToken, pterodactylServerId } = config;
    const timeout = Number(config.pterodactylTimeoutMs);
    const base = parsePanelOrigin(pterodactylBaseUrl);
    const hasCredentials = pterodactylApiToken.trim() && SERVER_ID_PATTERN.test(pterodactylServerId);
    const hasTimeout = Number.isSafeInteger(timeout) && timeout > 0;

    if (!base || !hasCredentials || !hasTimeout) {
        throw createError({ statusCode: 503, message: 'Подключение к Pterodactyl не настроено' });
    }

    const endpoint = `${base.origin}/api/client/servers/${pterodactylServerId}`;

    /**
     * Отправляет запрос к панели без перенаправлений и повторов.
     *
     * @param path Путь внутри API игрового сервера.
     * @param body Тело POST-запроса. Без тела выполняется GET.
     * @returns Текст ответа GET или пустая строка после подтверждённой команды.
     * @throws 502 при ошибке панели, 504 при таймауте.
     */
    async function request(path: string, body?: Record<string, string>): Promise<string> {
        const signal = AbortSignal.timeout(timeout);
        try {
            const response = await fetch(`${endpoint}${path}`, {
                method: body ? 'POST' : 'GET',
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${pterodactylApiToken}`,
                    ...(body && { 'Content-Type': 'application/json' }),
                },
                body: body ? JSON.stringify(body) : undefined,
                redirect: 'error',
                signal,
            });

            const accepted = body ? response.status === 204 : response.ok;

            if (!accepted) {
                await response.body?.cancel();
                throw new Error('Unexpected Pterodactyl response status');
            }

            return body ? '' : await response.text();
        } catch {
            throw createError({
                statusCode: signal.aborted ? 504 : 502,
                message: signal.aborted
                    ? 'Pterodactyl не ответил вовремя'
                    : 'Не удалось выполнить запрос к Pterodactyl',
            });
        }
    }

    /** Преобразует ошибку разбора ответа панели в HTTP 502. */
    function parseJson(text: string, message: string): unknown {
        try {
            return JSON.parse(text);
        } catch {
            throw createError({ statusCode: 502, message });
        }
    }

    /** Читает состояние процесса Minecraft и время его работы. */
    async function getServerResources() {
        const message = 'Pterodactyl вернул некорректный статус сервера';
        const result = resourcesSchema.safeParse(parseJson(await request('/resources'), message));
        if (!result.success) {
            throw createError({ statusCode: 502, message });
        }

        return {
            currentState: result.data.attributes.current_state,
            uptime: result.data.attributes.resources.uptime,
        };
    }

    /**
     * Читает файл из контейнера сервера через Pterodactyl.
     *
     * @param path Абсолютный путь внутри контейнера.
     */
    function readServerFile(path: string) {
        return request(`/files/contents?file=${encodeURIComponent(path)}`);
    }

    /** Читает и проверяет данные игровой сессии из `global.json`. */
    async function readGlobalSession() {
        const message = 'Не удалось прочитать состояние сессии из global.json';
        const result = globalSessionSchema.safeParse(parseJson(await readServerFile(GLOBAL_SESSION_PATH), message));
        if (!result.success) {
            throw createError({ statusCode: 502, message });
        }

        return result.data.session;
    }

    /** Проверяет, что в `server.properties` однозначно задано состояние вайтлиста. */
    async function readWhitelistEnabled() {
        const properties = await readServerFile(SERVER_PROPERTIES_PATH);
        const values = properties
            .split(/\r?\n/)
            .map(line => line.trim().match(WHITELIST_PROPERTY_PATTERN)?.[1]?.trim())
            .filter(value => value !== undefined);
        const [value] = values;
        if (values.length !== 1 || (value !== 'true' && value !== 'false')) {
            throw createError({
                statusCode: 502,
                message: 'Не удалось определить состояние вайтлиста по server.properties',
            });
        }

        return value === 'true';
    }

    return {
        getServerResources,
        readServerFile,
        readGlobalSession,
        readWhitelistEnabled,
        sendConsoleCommand: (command: string) => request('/command', { command }),
        sendPowerSignal: (signal: 'start' | 'stop' | 'restart') => request('/power', { signal }),
    };
}
