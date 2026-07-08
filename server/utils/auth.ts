import type { H3Event } from 'h3';
import { AUTH_STATUSES } from '~~/server/utils/constants/auth';

export function requireUser(event: H3Event) {
    const user = event.context.user;
    if (!user) {
        throw createError({ statusCode: 401, statusMessage: AUTH_STATUSES.UNAUTHORIZED });
    }

    return user;
}
