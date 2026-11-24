import type { H3Event } from 'h3';

import type {
    IGameSession,
    ISessionControlResponse,
    ISessionJobState,
    ISessionStartParams,
} from '~~/shared/@types/session-control';

import { randomUUID } from 'node:crypto';
import { setTimeout as delay } from 'node:timers/promises';

import { pingMinecraftServer } from './minecraft';
import { createPterodactylClient } from './pterodactyl';
import { formatGameSession } from './session-time';

const OFFLINE_POLL_MS = 2000;
const ONLINE_POLL_MS = 3000;
const OFFLINE_TIMEOUT_MS = 60000;
const ONLINE_TIMEOUT_MS = 180000;
const SERVER_SETTLE_MS = 5000;
const START_CHECK_ATTEMPTS = 4;
const STOP_CHECK_ATTEMPTS = 3;
const WHITELIST_SETTLE_MS = 1000;
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

/**
 * Подготавливает проверку доступности Minecraft для фоновой операции.
 *
 * @param event Событие Nitro для получения адреса игрового сервера.
 * @returns Функция пинга, которая возвращает `null`, когда Minecraft недоступен.
 */
function createMinecraftPing(event: H3Event) {
    const { minecraftHost, minecraftPort } = useRuntimeConfig(event);

    return () => pingMinecraftServer(minecraftHost, Number(minecraftPort)).catch(() => null);
}

/**
 * Собирает сводку сессии, сохраняя снимок операции до запросов к серверу.
 * Так опрос продолжится, если операция завершится во время чтения сводки.
 *
 * @param event Событие Nitro для чтения окружения.
 * @returns Состояние игры, вайтлиста и фоновой операции для админки.
 */
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
        session: session && formatGameSession(session),
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

/**
 * Опрашивает сервер до выполнения условия или истечения таймаута.
 *
 * @param check Проверяемое условие.
 * @param interval Пауза между попытками в миллисекундах.
 * @param timeout Бюджет ожидания в миллисекундах.
 * @param message Ошибка, которую увидит администратор при таймауте.
 */
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

/**
 * Перезапускает сервер, дожидается остановки старого процесса и готовности нового.
 *
 * @param pterodactyl Клиент панели для команды перезапуска и чтения состояния.
 * @param ping Функция проверки доступности Minecraft.
 */
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

/**
 * Проверяет, что Mappet записал ожидаемое состояние сессии в файл.
 *
 * @param pterodactyl Клиент панели для чтения файла сессии.
 * @param check Условие, которое подтверждает выполнение команды.
 * @param attempts Максимальное количество запросов.
 * @param interval Пауза перед каждой проверкой в миллисекундах.
 * @param message Ошибка, которую увидит администратор при неподтверждённой команде.
 */
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

/**
 * Меняет вайтлист через консоль и подтверждает изменение по `server.properties`.
 *
 * @param pterodactyl Клиент панели для отправки команды и чтения файла.
 * @param enabled Целевое состояние вайтлиста.
 */
async function setWhitelist(pterodactyl: TPterodactylClient, enabled: boolean) {
    currentJob.step = enabled ? 'Включение вайтлиста' : 'Выключение вайтлиста';
    await pterodactyl.sendConsoleCommand(enabled ? 'whitelist on' : 'whitelist off');
    await delay(WHITELIST_SETTLE_MS);

    if ((await pterodactyl.readWhitelistEnabled()) !== enabled) {
        throw new Error('Смена состояния вайтлиста не подтверждена');
    }
}

/** Перезапускает Minecraft, запускает новую сессию и выключает вайтлист после подтверждения. */
async function runStart(
    params: ISessionStartParams,
    previousIndex: number,
    pterodactyl: TPterodactylClient,
    ping: TPingServer,
): Promise<void> {
    await restartServer(pterodactyl, ping);

    currentJob.step = 'Запуск скрипта новой сессии';

    // Повтор команды после успешного старта может снова увеличить индекс и запустить расчёты.
    await pterodactyl.sendConsoleCommand(
        `mp script exec ~ handlers/session/handleSessionStart.js main {start_hour:${params.startHour},duration:${params.duration}}`,
    );
    await verifySession(
        pterodactyl,
        session => session.index > previousIndex && session.active,
        START_CHECK_ATTEMPTS,
        ONLINE_POLL_MS,
        'Не удалось подтвердить запуск игровой сессии',
    );

    await setWhitelist(pterodactyl, false);
}

/** Завершает сессию, включает вайтлист и перезапускает Minecraft. */
async function runStop(
    previousIndex: number,
    pterodactyl: TPterodactylClient,
    ping: TPingServer,
): Promise<void> {
    currentJob.step = 'Остановка сессии на сервере';

    await pterodactyl.sendConsoleCommand('mp script exec ~ handlers/session/handleSessionStop.js');
    await verifySession(
        pterodactyl,
        session => session.index === previousIndex && !session.active,
        STOP_CHECK_ATTEMPTS,
        OFFLINE_POLL_MS,
        'Не удалось подтвердить остановку игровой сессии',
    );

    await setWhitelist(pterodactyl, true);
    await restartServer(pterodactyl, ping);
}

/** Выполняет операцию, записывает результат и освобождает блокировку. */
async function runOperation(
    operation: TSessionOperation,
    previousIndex: number,
    pterodactyl: TPterodactylClient,
    ping: TPingServer,
): Promise<void> {
    try {
        if (operation.kind === 'start') {
            await runStart(operation.params, previousIndex, pterodactyl, ping);
        } else {
            await runStop(previousIndex, pterodactyl, ping);
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

/**
 * Захватывает блокировку перед проверкой состояния и передаёт операцию в фон.
 *
 * @param event Событие Nitro, к которому привязывается фоновая задача.
 * @param operation Действие администратора и параметры новой сессии при запуске.
 * @returns Начальный снимок принятой операции.
 * @throws 409 если операция уже идёт или состояние сервера не позволяет её выполнить.
 */
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
        event.waitUntil(runOperation(operation, previousSession.index, pterodactyl, ping));

        return { ...currentJob };
    } catch (error) {
        reserved = false;
        throw error;
    }
}
