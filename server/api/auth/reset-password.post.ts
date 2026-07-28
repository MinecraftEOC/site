import type { ISuccessResponse } from '~~/shared/@types/response';

import bcrypt from 'bcryptjs';

import { AUTH_ERRORS } from '~~/server/common/constants/auth';
import { sharedResetPasswordSchema } from '~~/shared/schemas/auth';

/**
 * `POST /api/auth/reset-password` — установка нового пароля по reset-токену.
 *
 * Валидирует тело схемой `sharedResetPasswordSchema`, проверяет валидность и срок
 * жизни токена, хэширует новый пароль и в одной транзакции обновляет пользователя
 * (сбрасывая токен) и удаляет все его сессии.
 *
 * @throws 400 если тело не прошло валидацию или токен недействителен/просрочен.
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
