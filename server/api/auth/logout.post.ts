import { SESSION_COOKIE } from '~~/server/utils/constants/auth';

export default defineEventHandler(async (event) => {
    const sessionId = event.context.session?.id;
    if (sessionId) {
        await prisma.session.deleteMany({ where: { id: sessionId } });
    }

    deleteCookie(event, SESSION_COOKIE);

    return { success: true };
});
