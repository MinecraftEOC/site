import type { H3Event } from 'h3';

import { Buffer } from 'node:buffer';
import { timingSafeEqual } from 'node:crypto';

import { UserRole } from '~~/generated/prisma/enums';
import { ERROR_STATUSES, SERVER_TOKEN_SCHEME } from '~~/server/common/constants/auth';

/**
 * Требует авторизованного пользователя для защищённого эндпоинта.
 *
 * Берёт пользователя из `event.context` (кладётся middleware) и кидает
 * `401 UNAUTHORIZED`, если его нет.
 *
 * @param event Текущее событие H3.
 * @returns Авторизованный пользователь ({@link ISafeUser}).
 * @throws `401` если пользователь не авторизован.
 */
export function requireUser(event: H3Event) {
    const user = event.context.user;
    if (!user) {
        throw createError({ statusCode: 401, statusMessage: ERROR_STATUSES.UNAUTHORIZED });
    }

    return user;
}

/**
 * Требует роли администратора для защищенного ресурса.
 *
 * @param event Текущее событие H3.
 * @returns Администратор ({@link ISafeUser}).
 * @throws `403` если пользователь не администратор.
 */
export function requireAdmin(event: H3Event) {
    const user = requireUser(event);
    if (user.role !== UserRole.ADMIN) {
        throw createError({ statusCode: 403, statusMessage: ERROR_STATUSES.FORBIDDEN });
    }

    return user;
}

/**
 * Требует валидный server-to-server токен для внутренних ручек
 * (например, запросов с игрового сервера).
 *
 * Токен передаётся в заголовке `Authorization: Bearer <token>` и сверяется
 * с приватным `serverApiToken` из `runtimeConfig` (env `NUXT_SERVER_API_TOKEN`).
 * Сравнение — за постоянное время. Cookie/сессия не используются, поэтому
 * из браузера ручку не дёрнуть.
 *
 * @param event Текущее событие H3.
 * @throws `500` если токен не настроен на сервере.
 * @throws `403` если токен не передан или не совпадает.
 */
export function requireServerToken(event: H3Event) {
    const expected = useRuntimeConfig(event).serverApiToken;
    if (!expected) {
        throw createError({ statusCode: 500, statusMessage: ERROR_STATUSES.SERVER_TOKEN_NOT_CONFIGURED });
    }

    const header = getHeader(event, 'authorization');
    const token = header?.startsWith(SERVER_TOKEN_SCHEME)
        ? header.slice(SERVER_TOKEN_SCHEME.length)
        : undefined;

    if (!token || !safeEqual(token, expected)) {
        throw createError({ statusCode: 403, statusMessage: ERROR_STATUSES.FORBIDDEN });
    }
}

/**
 * Сравнивает две строки за постоянное время (защита от timing-атак).
 *
 * @param a Первая строка.
 * @param b Вторая строка.
 * @returns `true`, если строки равны.
 */
function safeEqual(a: string, b: string) {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);

    if (bufA.length !== bufB.length) {
        return false;
    }

    return timingSafeEqual(bufA, bufB);
}
