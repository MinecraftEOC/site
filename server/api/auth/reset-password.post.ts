import type { IResetPasswordBody } from '~~/server/common/@types/auth';
import type { ISuccessResponse } from '~~/shared/@types/response';

import bcrypt from 'bcryptjs';

import { AUTH_ERRORS } from '~~/server/common/constants/auth';

/**
 * `POST /api/auth/reset-password` — установка нового пароля по reset-токену.
 *
 * Проверяет валидность и срок жизни токена, хэширует новый пароль и в одной
 * транзакции обновляет пользователя (сбрасывая токен) и удаляет все его сессии.
 *
 * @throws 400 если токен не передан, недействителен/просрочен, или пароль короче 8 символов.
 */
export default defineEventHandler(async (event): Promise<ISuccessResponse> => {
    const body = await readBody<IResetPasswordBody>(event);
    const token = body.token;
    const password = body.password;

    if (!token) {
        throw createError({ statusCode: 400, statusMessage: AUTH_ERRORS.EMPTY_RESET_TOKEN });
    }

    if (!password || password.length < 8) {
        throw createError({ statusCode: 400, statusMessage: AUTH_ERRORS.INVALID_PASSWORD });
    }

    const user = await prisma.user.findUnique({ where: { resetToken: token } });
    if (!user?.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
        throw createError({ statusCode: 400, statusMessage: AUTH_ERRORS.INVALID_RESET_TOKEN });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.$transaction([
        prisma.user.update({
            where: { id: user.id },
            data: { password: passwordHash, resetToken: null, resetTokenExpiry: null },
        }),
        prisma.session.deleteMany({ where: { userId: user.id } }),
    ]);

    return { success: true };
});
