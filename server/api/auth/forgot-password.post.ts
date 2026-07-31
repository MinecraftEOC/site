import type { ISuccessResponse } from '~~/shared/@types/response';

import { randomBytes } from 'node:crypto';

import { RESET_TOKEN_MAX_AGE } from '~~/server/common/constants/auth';
import { sharedForgotPasswordSchema } from '~~/shared/schemas/auth';

/**
 * `POST /api/auth/forgot-password` — выдача reset-токена по email. Успех
 * возвращается всегда, даже для несуществующего email: иначе по ответу можно
 * перебирать зарегистрированные аккаунты.
 *
 * @throws 400 если тело не прошло валидацию.
 */
export default defineEventHandler(async (event): Promise<ISuccessResponse> => {
    const { email } = await readValidatedBodyOr400(event, sharedForgotPasswordSchema);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        return { success: true };
    }

    const token = randomBytes(32).toString('hex');
    await prisma.user.update({
        where: { id: user.id },
        data: {
            resetToken: token,
            resetTokenExpiry: new Date(Date.now() + RESET_TOKEN_MAX_AGE * 1000),
        },
    });

    // TODO: делать отправку письма с ссылкой на сброс пароля

    return { success: true };
});
