import type { AuthBody } from '~~/server/types/auth';

import bcrypt from 'bcryptjs';

import { AUTH_STATUSES, SESSION_COOKIE, SESSION_MAX_AGE } from '~~/server/utils/constants/auth';

export default defineEventHandler(async (event) => {
    const body = await readBody<AuthBody>(event);
    const email = body.email?.trim().toLowerCase();
    const password = body.password;

    if (!email) {
        throw createError({ statusCode: 400, statusMessage: AUTH_STATUSES.EMPTY_EMAIL });
    }

    if (!password) {
        throw createError({ statusCode: 400, statusMessage: AUTH_STATUSES.EMPTY_PASSWORD });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    const isPasswordCorrect = user ? await bcrypt.compare(password, user.password) : false;

    if (!user || !isPasswordCorrect) {
        throw createError({ statusCode: 401, statusMessage: AUTH_STATUSES.INVALID_DATA });
    }

    const session = await prisma.session.create({
        data: {
            userId: user.id,
            expiresAt: new Date(Date.now() + SESSION_MAX_AGE * 1000),
        },
    });

    setCookie(event, SESSION_COOKIE, session.id, {
        httpOnly: true,
        secure: !import.meta.dev,
        sameSite: 'lax',
        path: '/',
        maxAge: SESSION_MAX_AGE,
    });

    return { id: user.id, email: user.email };
});
