import { SESSION_COOKIE } from '~~/server/constants/auth';

export default defineEventHandler(async (event) => {
    const sessionId = getCookie(event, SESSION_COOKIE);
    if (!sessionId) {
        return;
    }

    const session = await prisma.session.findUnique({
        where: { id: sessionId },
        include: {
            user: { select: {
                id: true,
                email: true,
                role: true,
            } },
        },
    });

    if (!session) {
        deleteCookie(event, SESSION_COOKIE);
        return;
    }

    if (session.expiresAt < new Date()) {
        await prisma.session.deleteMany({ where: { id: sessionId } });
        deleteCookie(event, SESSION_COOKIE);
        return;
    }

    event.context.user = session.user;
    event.context.session = { id: session.id, expiresAt: session.expiresAt };
});
