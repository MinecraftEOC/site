import type { IUserResponse } from '~~/shared/@types/response';

import { USER_ERRORS, USER_PUBLIC_SELECT } from '~~/server/common/constants/user';

/**
 * `GET /api/user` — пользователь по id. Только для администратора.
 *
 * @throws 404 если пользователь не найден.
 */
export default defineEventHandler(async (event): Promise<IUserResponse> => {
    requireAdmin(event);

    const { id } = getQuery<{ id?: string }>(event);
    if (id === undefined) {
        throw createError({ statusCode: 400, message: USER_ERRORS.EMPTY_ID });
    }

    const user = await prisma.user.findUnique({
        where: { id: Number(id) },
        select: USER_PUBLIC_SELECT,
    });

    if (!user) {
        throw createError({ statusCode: 404, message: USER_ERRORS.USER_NOT_FOUND });
    }

    return toUserResponse(user);
});
