import type { H3Event } from 'h3';

import type { IStatusResponse } from '~~/shared/@types/response';

import { STATUS_CACHE_TTL } from '~~/server/common/constants/server-status';

/** Ответ, когда игровой сервер недоступен. */
const OFFLINE_STATUS: IStatusResponse = {
    online: false,
    players: 0,
    maxPlayers: 0,
    sample: [],
    version: null,
};

let cache: { status: IStatusResponse; expiresAt: number } | null = null;
let pending: Promise<IStatusResponse> | null = null;

/**
 * Пингует игровой сервер и приводит его ответ к контракту сайта.
 *
 * @param event Событие запроса — из него берётся runtime-конфиг.
 * @returns Статус сервера; недоступность возвращается как `OFFLINE_STATUS`, а не ошибкой.
 */
async function loadStatus(event: H3Event): Promise<IStatusResponse> {
    const { minecraftHost, minecraftPort } = useRuntimeConfig(event);

    try {
        const status = await pingMinecraftServer(minecraftHost, minecraftPort);

        return {
            online: true,
            players: status.players?.online ?? 0,
            maxPlayers: status.players?.max ?? 0,
            sample: status.players?.sample?.map(player => player.name) ?? [],
            version: status.version?.name ?? null,
        };
    } catch {
        return OFFLINE_STATUS;
    }
}

/**
 * `GET /api/status` — онлайн игрового сервера. Публичная ручка, результат кэшируется.
 */
export default defineEventHandler(async (event): Promise<IStatusResponse> => {
    if (cache && cache.expiresAt > Date.now()) {
        return cache.status;
    }

    // Один пинг на всех: иначе каждый заход на страницу открывал бы свой сокет,
    // пока предыдущий ещё ждёт ответа.
    pending ??= (async () => {
        try {
            const status = await loadStatus(event);
            cache = { status, expiresAt: Date.now() + STATUS_CACHE_TTL };

            return status;
        } finally {
            pending = null;
        }
    })();

    return pending;
});
