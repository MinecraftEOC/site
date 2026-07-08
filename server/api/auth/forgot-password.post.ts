import { randomBytes } from 'node:crypto';

import { AUTH_STATUSES, RESET_TOKEN_MAX_AGE } from '~~/server/constants/auth';

export default defineEventHandler(async (event) => {
    const body = await readBody<{ email?: string }>(event);
    const email = body.email?.trim().toLowerCase();

    if (!email) {
        throw createError({ statusCode: 400, statusMessage: AUTH_STATUSES.EMPTY_EMAIL });
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
