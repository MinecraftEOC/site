import type { IUserResponse } from '~~/shared/@types/response';

import { USER_PUBLIC_SELECT } from '~~/server/common/constants/user';

/**
 * `GET /api/user/list` — все пользователи с персонажами и Discord-аккаунтом.
 * Только для администратора.
 *
 * @throws 401 если запрос не авторизован.
 * @throws 403 если пользователь не администратор.
 */
export default defineEventHandler(async (event): Promise<IUserResponse[]> => {
    requireAdmin(event);

    const users = await prisma.user.findMany({
        select: USER_PUBLIC_SELECT,
    });

    return users.map(toUserResponse);
});
