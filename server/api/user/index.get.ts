import type { IUserParams } from '~~/server/common/@types/user';
import type { IUserResponse } from '~~/shared/@types/response';

import { ERROR_STATUSES } from '~~/server/common/constants/auth';
import { USER_PUBLIC_SELECT } from '~~/server/common/constants/user';

/**
 * `GET /api/user` — поиск пользователя по id
 * Доступно только администратору.
 * @throws 404 если пользователь под заданные условия не найден.
 */
export default defineEventHandler(async (event): Promise<IUserResponse> => {
    requireAdmin(event);

    const { id } = getQuery<IUserParams>(event);

    const user = await prisma.user.findUnique({
        where: { id: Number(id) },
        select: USER_PUBLIC_SELECT,
    });

    if (!user) {
        throw createError({ statusCode: 404, statusMessage: ERROR_STATUSES.USER_NOT_FOUND });
    }

    return user;
});
