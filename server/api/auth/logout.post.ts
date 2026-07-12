import type { ISuccessResponse } from '~~/shared/@types/response';

import { SESSION_COOKIE } from '~~/server/common/constants/auth';

/**
 * `POST /api/auth/logout` — выход из аккаунта.
 *
 * Удаляет текущую сессию из БД (если она есть) и очищает cookie сессии.
 * Идемпотентна: без активной сессии просто возвращает успех.
 */
export default defineEventHandler(async (event): Promise<ISuccessResponse> => {
    const sessionId = event.context.session?.id;
    if (sessionId) {
        await prisma.session.deleteMany({ where: { id: sessionId } });
    }

    deleteCookie(event, SESSION_COOKIE);

    return { success: true };
});
