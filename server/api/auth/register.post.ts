import type { IAuthBody } from '~~/server/common/@types/auth';
import type { IRegisterResponse } from '~~/shared/@types/response';

import bcrypt from 'bcryptjs';

import { ERROR_STATUSES } from '~~/server/common/constants/auth';

const EMAIL_REGEX = /^[\w.%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;

/**
 * `POST /api/auth/register` — регистрация нового пользователя.
 *
 * Валидирует email и длину пароля, хэширует пароль (`bcrypt`) и создаёт
 * пользователя. Сессию не создаёт — вход выполняется отдельно.
 *
 * @throws 400 если email некорректен или пароль короче 8 символов.
 * @throws 409 если пользователь с таким email уже существует.
 */
export default defineEventHandler(async (event): Promise<IRegisterResponse> => {
    const body = await readBody<IAuthBody>(event);
    const email = body.email?.trim().toLowerCase();
    const password = body.password;

    if (!email || !EMAIL_REGEX.test(email)) {
        throw createError({ statusCode: 400, statusMessage: ERROR_STATUSES.INVALID_EMAIL });
    }

    if (!password || password.length < 8) {
        throw createError({ statusCode: 400, statusMessage: ERROR_STATUSES.INVALID_PASSWORD });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
        throw createError({ statusCode: 409, statusMessage: ERROR_STATUSES.USER_EXISTS });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const created = await prisma.user.create({
        data: { email, password: passwordHash },
        select: { id: true, email: true, createdAt: true },
    });

    return { id: created.id, email: created.email, createdAt: created.createdAt.toISOString() };
});
