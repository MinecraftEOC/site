import type { IUserAdminResponse } from '~~/shared/@types/response';

import { CHARACTER_PUBLIC_SELECT } from '~~/server/common/constants/character';
import { USER_PUBLIC_SELECT } from '~~/server/common/constants/user';

/**
 * `GET /api/user/list` — все пользователи с персонажами и Discord-аккаунтом.
 * Только для администратора.
 *
 * @throws 401 если запрос не авторизован.
 * @throws 403 если пользователь не администратор.
 */
export default defineEventHandler(async (event): Promise<IUserAdminResponse[]> => {
    requireAdmin(event);

    const users = await prisma.user.findMany({
        select: {
            ...USER_PUBLIC_SELECT,
            characters: {
                select: { ...CHARACTER_PUBLIC_SELECT, uuid: true },
            },
        },
        orderBy: { id: 'asc' },
    });

    return users.map(({ characters, ...user }) => ({
        ...toUserResponse({ ...user, characters: [] }),
        characters: characters.map(character => ({
            ...toCharacterResponse(character),
            uuid: character.uuid,
        })),
    }));
});
