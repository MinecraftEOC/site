import type { H3Event } from 'h3';
import { AUTH_STATUSES } from '~~/server/constants/auth';

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
        throw createError({ statusCode: 401, statusMessage: AUTH_STATUSES.UNAUTHORIZED });
    }

    return user;
}
