import type { IMeResponse } from '~~/shared/@types/response';

import { ERROR_STATUSES } from '~~/server/common/constants/auth';
import { USER_PUBLIC_SELECT } from '~~/server/common/constants/user';

/**
 * `GET /api/me` — данные текущего авторизованного пользователя.
 *
 * Пользователь определяется по сессии (`requireUser`); возвращаются его
 * персонажи и привязанный Discord-аккаунт.
 *
 * @throws 401 если запрос не авторизован.
 * @throws 404 если пользователь из сессии не найден в БД.
 */
export default defineEventHandler(async (event): Promise<IMeResponse> => {
    const { id } = requireUser(event);

    const user = await prisma.user.findUnique({
        where: { id },
        select: USER_PUBLIC_SELECT,
    });

    if (!user) {
        throw createError({ statusCode: 404, statusMessage: ERROR_STATUSES.USER_NOT_FOUND });
    }

    return user;
});
