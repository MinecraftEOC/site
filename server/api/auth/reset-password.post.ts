import type { ISuccessResponse } from '~~/shared/@types/response';

import bcrypt from 'bcryptjs';

import { AUTH_ERRORS } from '~~/server/common/constants/auth';
import { sharedResetPasswordSchema } from '~~/shared/schemas/auth';

/**
 * `POST /api/auth/reset-password` — смена пароля по reset-токену. Гасит токен
 * и удаляет все сессии пользователя.
 *
 * @throws 400 если тело не прошло валидацию или токен недействителен либо просрочен.
 */
export default defineEventHandler(async (event): Promise<ISuccessResponse> => {
    const { token, password } = await readValidatedBodyOr400(event, sharedResetPasswordSchema);

    const user = await prisma.user.findUnique({ where: { resetToken: token } });
    if (!user?.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
        throw createError({ statusCode: 400, message: AUTH_ERRORS.INVALID_RESET_TOKEN });
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
