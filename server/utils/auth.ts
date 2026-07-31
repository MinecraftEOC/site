import type { H3Event } from 'h3';

import { Buffer } from 'node:buffer';
import { timingSafeEqual } from 'node:crypto';

import { UserRole } from '~~/generated/prisma/enums';
import { AUTH_ERRORS, SERVER_TOKEN_SCHEME } from '~~/server/common/constants/auth';

/**
 * Возвращает пользователя, положенного в контекст сессионным middleware.
 *
 * @param event Текущее событие H3.
 * @returns Авторизованный пользователь ({@link ISafeUser}).
 * @throws `401` если запрос не авторизован.
 */
export function requireUser(event: H3Event) {
    const user = event.context.user;
    if (!user) {
        throw createError({ statusCode: 401, message: AUTH_ERRORS.UNAUTHORIZED });
    }

    return user;
}

/**
 * Возвращает пользователя из контекста, если он администратор.
 *
 * @param event Текущее событие H3.
 * @returns Администратор ({@link ISafeUser}).
 * @throws `401` если запрос не авторизован.
 * @throws `403` если пользователь не администратор.
 */
export function requireAdmin(event: H3Event) {
    const user = requireUser(event);
    if (user.role !== UserRole.ADMIN) {
        throw createError({ statusCode: 403, message: AUTH_ERRORS.FORBIDDEN });
    }

    return user;
}

/**
 * Сверяет токен из `Authorization: Bearer` с `runtimeConfig.serverApiToken`.
 * Сессия и роль не участвуют — из браузера такую ручку не дёрнуть.
 *
 * @param event Текущее событие H3.
 * @throws `500` если токен не настроен на сервере.
 * @throws `403` если токен не передан или не совпадает.
 */
export function requireServerToken(event: H3Event) {
    const expected = useRuntimeConfig(event).serverApiToken;
    if (!expected) {
        throw createError({ statusCode: 500, message: AUTH_ERRORS.SERVER_TOKEN_NOT_CONFIGURED });
    }

    const header = getHeader(event, 'authorization');
    const token = header?.startsWith(SERVER_TOKEN_SCHEME)
        ? header.slice(SERVER_TOKEN_SCHEME.length)
        : undefined;

    if (!token || !safeEqual(token, expected)) {
        throw createError({ statusCode: 403, message: AUTH_ERRORS.FORBIDDEN });
    }
}

/**
 * Сравнивает строки за постоянное время — защита от timing-атак.
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
