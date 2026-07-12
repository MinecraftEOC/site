import type { IAuthBody } from '~~/server/common/@types/auth';
import type { ILoginResponse } from '~~/shared/@types/response';

import bcrypt from 'bcryptjs';

import { AUTH_ERRORS, SESSION_COOKIE, SESSION_MAX_AGE } from '~~/server/common/constants/auth';

/**
 * `POST /api/auth/login` — вход по email и паролю.
 *
 * При успехе создаёт сессию и кладёт её id в httpOnly-cookie.
 *
 * @throws 400 если email или пароль не переданы.
 * @throws 401 если пользователь не найден или пароль неверный.
 */
export default defineEventHandler(async (event): Promise<ILoginResponse> => {
    const body = await readBody<IAuthBody>(event);
    const email = body.email?.trim().toLowerCase();
    const password = body.password;

    if (!email) {
        throw createError({ statusCode: 400, statusMessage: AUTH_ERRORS.EMPTY_EMAIL });
    }

    if (!password) {
        throw createError({ statusCode: 400, statusMessage: AUTH_ERRORS.EMPTY_PASSWORD });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    const isPasswordCorrect = user ? await bcrypt.compare(password, user.password) : false;

    if (!user || !isPasswordCorrect) {
        throw createError({ statusCode: 401, statusMessage: AUTH_ERRORS.INVALID_DATA });
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
