import type { IRegisterResponse } from '~~/shared/@types/response';

import bcrypt from 'bcryptjs';

import { USER_ERRORS } from '~~/server/common/constants/user';
import { sharedRegisterSchema } from '~~/shared/schemas/auth';

/**
 * `POST /api/auth/register` — регистрация пользователя. Сессию не создаёт,
 * вход выполняется отдельно.
 *
 * @throws 400 если тело не прошло валидацию.
 * @throws 409 если email уже занят.
 */
export default defineEventHandler(async (event): Promise<IRegisterResponse> => {
    const { email, password } = await readValidatedBodyOr400(event, sharedRegisterSchema);

    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
        throw createError({ statusCode: 409, message: USER_ERRORS.USER_EXISTS });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const created = await prisma.user.create({
        data: { email, password: passwordHash },
        select: { id: true, email: true, createdAt: true },
    });

    return { id: created.id, email: created.email, createdAt: created.createdAt.toISOString() };
});
