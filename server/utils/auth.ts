import type { H3Event } from 'h3';

import { UserRole } from '~~/generated/prisma/enums';
import { ERROR_STATUSES } from '~~/server/common/constants/auth';

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
