import { CharacterStatus } from '~~/generated/prisma/enums';

/**
 * Статусы, в которых персонаж выведен из игры: он больше не считается «живым»,
 * не мешает создать нового и не участвует в поиске текущего персонажа.
 */
export const CHARACTER_RETIRED_STATUSES: CharacterStatus[] = [CharacterStatus.DEAD, CharacterStatus.UNAVAILABLE];

/** Статусы, в которых пользователь может редактировать своего персонажа. */
export const CHARACTER_EDITABLE_STATUSES: CharacterStatus[] = [CharacterStatus.UNVERIFIED, CharacterStatus.RETURNED];

/**
 * Занимает ли персонаж слот игрока. Считается от {@link CHARACTER_RETIRED_STATUSES},
 * как и на бэке: новый статус в enum по умолчанию трактуется как «живой»
 * одинаково на обеих сторонах.
 *
 * @param status Статус персонажа.
 * @returns `true`, если персонаж не выведен из игры.
 */
export function isCharacterLive(status: CharacterStatus): boolean {
    return !CHARACTER_RETIRED_STATUSES.includes(status);
}
