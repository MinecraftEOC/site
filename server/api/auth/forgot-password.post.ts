import type { ISuccessResponse } from '~~/shared/@types/response';

import { randomBytes } from 'node:crypto';

import { AUTH_ERRORS, RESET_TOKEN_MAX_AGE } from '~~/server/common/constants/auth';

/**
 * `POST /api/auth/forgot-password` — запрос на восстановление пароля.
 *
 * Генерирует reset-токен со сроком жизни и сохраняет его пользователю.
 * Всегда возвращает успех (даже если email не найден) — чтобы не раскрывать
 * существование аккаунтов.
 *
 * @throws 400 если email не передан.
 */
export default defineEventHandler(async (event): Promise<ISuccessResponse> => {
    const body = await readBody<{ email?: string }>(event);
    const email = body.email?.trim().toLowerCase();

    if (!email) {
        throw createError({ statusCode: 400, statusMessage: AUTH_ERRORS.EMPTY_EMAIL });
    }

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
