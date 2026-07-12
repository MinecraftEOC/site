import type { IUserResponse } from '~~/shared/@types/response';

import { USER_PUBLIC_SELECT } from '~~/server/common/constants/user';

/**
 * `GET /api/user/list` — список всех пользователей.
 *
 * Доступно только администратору. Каждый пользователь возвращается с персонажами
 * и привязанным Discord-аккаунтом (см. {@link USER_PUBLIC_SELECT}).
 *
 * @throws 401 если запрос не авторизован.
 * @throws 403 если пользователь не администратор.
 */
export default defineEventHandler(async (event): Promise<IUserResponse[]> => {
    requireAdmin(event);

    const users = await prisma.user.findMany({
        select: USER_PUBLIC_SELECT,
    });

    return users;
});
