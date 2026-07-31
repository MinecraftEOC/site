import type { ILoginResponse } from '~~/shared/@types/response';

import bcrypt from 'bcryptjs';

import { AUTH_ERRORS, SESSION_COOKIE, SESSION_MAX_AGE } from '~~/server/common/constants/auth';
import { USER_PUBLIC_SELECT } from '~~/server/common/constants/user';
import { sharedLoginSchema } from '~~/shared/schemas/auth';

/**
 * `POST /api/auth/login` — вход по email и паролю: создаёт сессию и ставит cookie.
 *
 * @throws 400 если тело не прошло валидацию.
 * @throws 401 если email не найден или пароль неверный.
 */
export default defineEventHandler(async (event): Promise<ILoginResponse> => {
    const { email, password } = await readValidatedBodyOr400(event, sharedLoginSchema);

    const user = await prisma.user.findUnique({
        where: { email },
        select: { ...USER_PUBLIC_SELECT, password: true },
    });

    const isPasswordCorrect = user ? await bcrypt.compare(password, user.password) : false;

    if (!user || !isPasswordCorrect) {
        throw createError({ statusCode: 401, message: AUTH_ERRORS.INVALID_DATA });
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

    const { password: _password, ...userWithoutPassport } = user;

    return toUserResponse(userWithoutPassport);
});
