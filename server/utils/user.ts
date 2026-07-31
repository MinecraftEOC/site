import type { TUserRow } from '~~/server/common/@types/user';
import type { IUserResponse } from '~~/shared/@types/response';

/**
 * Приводит пользователя из Prisma к форме ответа API вместе с персонажами.
 *
 * @param user Пользователь в форме `USER_PUBLIC_SELECT`.
 * @returns Пользователь с сериализованными персонажами.
 */
export function toUserResponse(user: TUserRow): IUserResponse {
    return {
        ...user,
        characters: user.characters.map(toCharacterResponse),
    };
}
