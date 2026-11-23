import type { H3Event } from 'h3';

import type {
    IGameSession,
    ISessionControlResponse,
    ISessionJobState,
    ISessionStartParams,
} from '~~/shared/@types/session-control';

import { randomUUID } from 'node:crypto';
import { setTimeout as delay } from 'node:timers/promises';

import { SESSION_TOTAL_TICKS } from '~~/shared/constants/session-control';

import { pingMinecraftServer } from './minecraft';
import { createPterodactylClient } from './pterodactyl';

const OFFLINE_POLL_MS = 2000;
const ONLINE_POLL_MS = 3000;
const OFFLINE_TIMEOUT_MS = 60000;
const ONLINE_TIMEOUT_MS = 180000;
const SERVER_SETTLE_MS = 5000;
const START_CHECK_ATTEMPTS = 4;
const STOP_CHECK_ATTEMPTS = 3;
const WHITELIST_SETTLE_MS = 1000;
const GAME_TICKS_PER_HOUR = 1000;
const MINUTES_PER_HOUR = 60;
const SECONDS_PER_HOUR = 3600;
const SECONDS_PER_MINUTE = 60;
const GAME_HOURS_PER_DAY = 24;
const SESSION_TICK_INTERVAL_SECONDS = 10;
const EPOCH_YEAR = 1000;
const DAYS_PER_GAME_YEAR = 365;
const GAME_MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

type TPterodactylClient = ReturnType<typeof createPterodactylClient>;
type TPingServer = ReturnType<typeof createMinecraftPing>;
type TSessionOperation = { kind: 'start'; params: ISessionStartParams } | { kind: 'stop' };

let reserved = false;
let currentJob: ISessionJobState = {
    id: null,
    kind: null,
    status: 'idle',
    step: '',
    startedAt: null,
    finishedAt: null,
    error: null,
};

function createMinecraftPing(event: H3Event) {
    const { minecraftHost, minecraftPort } = useRuntimeConfig(event);
    return () => pingMinecraftServer(minecraftHost, Number(minecraftPort)).catch(() => null);
}

function formatSession(session: IGameSession) {
    const gameMinutes
        = (session.start_hour * MINUTES_PER_HOUR + Math.floor((session.ticks * MINUTES_PER_HOUR) / GAME_TICKS_PER_HOUR))
            % (GAME_HOURS_PER_DAY * MINUTES_PER_HOUR);
    const pad = (value: number) => String(value).padStart(2, '0');
    const formattedTime = `${pad(Math.floor(gameMinutes / MINUTES_PER_HOUR))}:${pad(gameMinutes % MINUTES_PER_HOUR)}`;

    const year = EPOCH_YEAR + Math.floor(session.index / DAYS_PER_GAME_YEAR);
    let days = session.index % DAYS_PER_GAME_YEAR;
    let month = 1;
    for (const monthDays of GAME_MONTH_DAYS) {
        if (days < monthDays) {
            break;
        }

        days -= monthDays;
        month++;
    }

    const ticksPerCall = Math.floor(
        SESSION_TOTAL_TICKS / ((session.duration * SECONDS_PER_HOUR) / SESSION_TICK_INTERVAL_SECONDS),
    );
    const minutesLeft = session.active
        ? Math.floor(
                (((SESSION_TOTAL_TICKS - session.ticks) / ticksPerCall) * SESSION_TICK_INTERVAL_SECONDS)
                / SECONDS_PER_MINUTE,
            )
        : 0;
    const hoursLeft = Math.floor(minutesLeft / MINUTES_PER_HOUR);
    const remainingMinutes = minutesLeft % MINUTES_PER_HOUR;

    return {
        ...session,
        formattedDate: `${pad(days + 1)}.${pad(month)}.${year}`,
        formattedTime,
        remainingTime: hoursLeft ? `${hoursLeft}ч ${remainingMinutes}м` : `${remainingMinutes}м`,
    };
}

export async function getSessionControlStatus(event: H3Event): Promise<ISessionControlResponse> {
    const pterodactyl = createPterodactylClient(event);
    const job = { ...currentJob };
    const [session, whitelistEnabled, resources, ping] = await Promise.all([
        pterodactyl.readGlobalSession().catch(() => null),
        pterodactyl.readWhitelistEnabled().catch(() => null),
        pterodactyl.getServerResources().catch(() => null),
        createMinecraftPing(event)(),
    ]);

    return {
        session: session && formatSession(session),
        whitelistEnabled,
        server: {
            state: resources?.currentState ?? null,
            online: ping !== null,
            players: ping?.players?.online ?? null,
            maxPlayers: ping?.players?.max ?? null,
        },
        job,
    };
}

async function waitUntil(check: () => Promise<boolean>, interval: number, timeout: number, message: string) {
    const deadline = Date.now() + timeout;
    while (Date.now() < deadline) {
        if (await check()) {
            return;
        }

        await delay(Math.min(interval, Math.max(0, deadline - Date.now())));
    }

    throw new Error(message);
}

async function restartServer(pterodactyl: TPterodactylClient, ping: TPingServer) {
    currentJob.step = 'Перезапуск сервера';
    await pterodactyl.sendPowerSignal('restart');

    currentJob.step = 'Ожидание остановки старого процесса';
    await waitUntil(
        async () => {
            if (!(await ping())) {
                return true;
            }

            const resources = await pterodactyl.getServerResources().catch(() => null);
            return resources !== null && resources.currentState !== 'running';
        },
        OFFLINE_POLL_MS,
        OFFLINE_TIMEOUT_MS,
        'Сервер не подтвердил остановку старого процесса',
    );

    currentJob.step = 'Ожидание загрузки мира';
    await waitUntil(
        async () => {
            const resources = await pterodactyl.getServerResources().catch(() => null);
            if (resources?.currentState !== 'running' || !(await ping())) {
                return false;
            }

            await delay(SERVER_SETTLE_MS);
            return Boolean(await ping());
        },
        ONLINE_POLL_MS,
        ONLINE_TIMEOUT_MS,
        'Сервер Minecraft не запустился за отведённое время',
    );
}

async function verifySession(
    pterodactyl: TPterodactylClient,
    check: (session: IGameSession) => boolean,
    attempts: number,
    interval: number,
    message: string,
) {
    for (let attempt = 0; attempt < attempts; attempt++) {
        await delay(interval);
        const session = await pterodactyl.readGlobalSession().catch(() => null);
        if (session && check(session)) {
            return;
        }
    }

    throw new Error(message);
}

async function setWhitelist(pterodactyl: TPterodactylClient, enabled: boolean) {
    currentJob.step = enabled ? 'Включение вайтлиста' : 'Выключение вайтлиста';
    await pterodactyl.sendConsoleCommand(enabled ? 'whitelist on' : 'whitelist off');
    await delay(WHITELIST_SETTLE_MS);

    if ((await pterodactyl.readWhitelistEnabled()) !== enabled) {
        throw new Error('Смена состояния вайтлиста не подтверждена');
    }
}

async function runOperation(
    operation: TSessionOperation,
    previousSession: IGameSession,
    pterodactyl: TPterodactylClient,
    ping: TPingServer,
) {
    try {
        if (operation.kind === 'start') {
            await restartServer(pterodactyl, ping);

            currentJob.step = 'Запуск скрипта новой сессии';
            const { startHour, duration } = operation.params;
            // After a successful start, another command can advance the session index again.
            await pterodactyl.sendConsoleCommand(
                `mp script exec ~ handlers/session/handleSessionStart.js main {start_hour:${startHour},duration:${duration}}`,
            );
            await verifySession(
                pterodactyl,
                session => session.index > previousSession.index && session.active,
                START_CHECK_ATTEMPTS,
                ONLINE_POLL_MS,
                'Не удалось подтвердить запуск игровой сессии',
            );

            await setWhitelist(pterodactyl, false);
        } else {
            currentJob.step = 'Остановка сессии на сервере';
            await pterodactyl.sendConsoleCommand('mp script exec ~ handlers/session/handleSessionStop.js');
            await verifySession(
                pterodactyl,
                session => session.index === previousSession.index && !session.active,
                STOP_CHECK_ATTEMPTS,
                OFFLINE_POLL_MS,
                'Не удалось подтвердить остановку игровой сессии',
            );

            await setWhitelist(pterodactyl, true);
            await restartServer(pterodactyl, ping);
        }

        currentJob.status = 'success';
        currentJob.step = operation.kind === 'start' ? 'Сессия запущена' : 'Сессия остановлена';
    } catch (error) {
        currentJob.status = 'error';
        currentJob.error = error instanceof Error ? error.message : 'Не удалось выполнить операцию над сессией';
    } finally {
        currentJob.finishedAt = new Date().toISOString();
        reserved = false;
    }
}

export async function startSessionOperation(event: H3Event, operation: TSessionOperation): Promise<ISessionJobState> {
    if (reserved) {
        throw createError({ statusCode: 409, message: 'Уже выполняется операция над сессией' });
    }

    reserved = true;
    try {
        const pterodactyl = createPterodactylClient(event);
        const previousSession = await pterodactyl.readGlobalSession();

        if (operation.kind === 'start' && previousSession.active) {
            throw createError({ statusCode: 409, message: 'Игровая сессия уже запущена' });
        }

        if (operation.kind === 'stop' && !previousSession.active) {
            throw createError({ statusCode: 409, message: 'Игровая сессия уже остановлена' });
        }

        const resources = await pterodactyl.getServerResources();
        if (resources.currentState !== 'running') {
            throw createError({ statusCode: 409, message: 'Сначала запустите сервер Minecraft в панели Pterodactyl' });
        }

        if (operation.kind === 'start' && !(await pterodactyl.readWhitelistEnabled())) {
            throw createError({ statusCode: 409, message: 'Перед запуском сессии включите вайтлист' });
        }

        const ping = createMinecraftPing(event);
        currentJob = {
            id: randomUUID(),
            kind: operation.kind,
            status: 'running',
            step: '',
            startedAt: new Date().toISOString(),
            finishedAt: null,
            error: null,
        };
        event.waitUntil(runOperation(operation, previousSession, pterodactyl, ping));

        return { ...currentJob };
    } catch (error) {
        reserved = false;
        throw error;
    }
}
