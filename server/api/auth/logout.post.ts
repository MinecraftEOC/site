import type { ISuccessResponse } from '~~/shared/types/response';

import { SESSION_COOKIE } from '~~/server/constants/auth';

export default defineEventHandler(async (event): Promise<ISuccessResponse> => {
    const sessionId = event.context.session?.id;
    if (sessionId) {
        await prisma.session.deleteMany({ where: { id: sessionId } });
    }

    deleteCookie(event, SESSION_COOKIE);

    return { success: true };
});
