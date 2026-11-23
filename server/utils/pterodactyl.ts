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

export function createPterodactylClient(event: H3Event) {
    const config = useRuntimeConfig(event);
    const { pterodactylBaseUrl, pterodactylApiToken, pterodactylServerId } = config;
    const timeout = Number(config.pterodactylTimeoutMs);
    const base = URL.canParse(pterodactylBaseUrl) ? new URL(pterodactylBaseUrl) : null;

    if (
        !base
        || !['https:', 'http:'].includes(base.protocol)
        || base.username
        || base.password
        || base.pathname !== '/'
        || base.search
        || base.hash
        || !pterodactylApiToken.trim()
        || !SERVER_ID_PATTERN.test(pterodactylServerId)
        || !Number.isSafeInteger(timeout)
        || timeout < 1
    ) {
        throw createError({ statusCode: 503, message: 'Подключение к Pterodactyl не настроено' });
    }

    const endpoint = `${base.origin}/api/client/servers/${pterodactylServerId}`;

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

            if (body ? response.status !== 204 : !response.ok) {
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

    function parseJson(text: string, message: string): unknown {
        try {
            return JSON.parse(text);
        } catch {
            throw createError({ statusCode: 502, message });
        }
    }

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

    function readServerFile(path: string) {
        return request(`/files/contents?file=${encodeURIComponent(path)}`);
    }

    async function readGlobalSession() {
        const message = 'Не удалось прочитать состояние сессии из global.json';
        const result = globalSessionSchema.safeParse(parseJson(await readServerFile(GLOBAL_SESSION_PATH), message));
        if (!result.success) {
            throw createError({ statusCode: 502, message });
        }

        return result.data.session;
    }

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
