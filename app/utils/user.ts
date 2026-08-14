import type { CharacterStatus } from '~~/generated/prisma/enums';
import type { ICharacter, IUser } from '~~/shared/@types/user';
import type { IUsersRow } from '~/@types/user';

import { DiscordLinkStatus } from '~~/generated/prisma/enums';
import { CHARACTER_STATUS_ORDER } from '~/assets/ts/constants/character';
import { ESortDirection, EUsersColumn } from '~/assets/ts/enums/user';

/**
 * Сортирует персонажей пользователя по важности для администрации: сначала
 * порядок статусов, внутри статуса — новые сверху.
 *
 * @param characters Персонажи пользователя.
 * @returns Новый отсортированный массив.
 */
export function sortCharacters(characters: ICharacter[]): ICharacter[] {
    return [...characters].sort((a, b) => {
        const weight = getStatusWeight(a.status) - getStatusWeight(b.status);

        if (weight !== 0) {
            return weight;
        }

        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
}

/**
 * Проверяет, доведена ли у пользователя привязка Discord до конца.
 *
 * @param user Пользователь с его Discord-аккаунтом.
 * @returns `true`, если привязка подтверждена ботом.
 */
export function isDiscordLinked(user: IUser): boolean {
    return user.discordAccount?.status === DiscordLinkStatus.LINKED;
}

/**
 * Проверяет, подходит ли пользователь под поисковый запрос.
 *
 * @param user Пользователь со всеми персонажами.
 * @param query Запрос в нижнем регистре и без пробелов по краям.
 * @returns `true`, если запрос пуст либо нашёлся в email, нике Discord или имени персонажа.
 */
export function matchesUserSearch(user: IUser, query: string): boolean {
    if (!query) {
        return true;
    }

    const fields = [
        user.email,
        user.discordAccount?.username ?? '',
        ...user.characters.map(character => character.username),
    ];

    return fields.some(field => field.toLowerCase().includes(query));
}

/**
 * Сравнивает две строки таблицы игроков по выбранной колонке.
 *
 * @param first Первая строка.
 * @param second Вторая строка.
 * @param column Колонка, по которой идёт сортировка.
 * @param direction Направление сортировки.
 * @returns Отрицательное, нулевое или положительное число для `Array.sort`.
 */
export function compareUsersRows(first: IUsersRow, second: IUsersRow, column: EUsersColumn, direction: ESortDirection): number {
    const a = getSortValue(first, column);
    const b = getSortValue(second, column);

    // Строки без персонажа держатся внизу в обе стороны сортировки: сравнивать
    // в колонках персонажа у них нечего.
    if (a === null || b === null) {
        if (a === b) {
            return 0;
        }

        return a === null ? 1 : -1;
    }

    const order = typeof a === 'string' && typeof b === 'string'
        ? a.localeCompare(b)
        : Number(a) - Number(b);

    return direction === ESortDirection.Asc ? order : -order;
}

/**
 * Отдаёт вес статуса для сортировки — позицию в {@link CHARACTER_STATUS_ORDER}.
 *
 * @param status Статус персонажа.
 * @returns Индекс статуса в порядке админки.
 */
function getStatusWeight(status: CharacterStatus): number {
    return CHARACTER_STATUS_ORDER.indexOf(status);
}

/**
 * Достаёт из строки значение колонки, по которому строки сравниваются.
 *
 * @param row Строка таблицы игроков.
 * @param column Колонка сортировки.
 * @returns Число или строка для сравнения, либо `null`, если сравнивать нечего.
 */
function getSortValue(row: IUsersRow, column: EUsersColumn): number | string | null {
    switch (column) {
        case EUsersColumn.Id:
            return row.user.id;
        case EUsersColumn.Email:
            return row.user.email.toLowerCase();
        case EUsersColumn.Discord:
            return row.user.discordAccount?.username?.toLowerCase() ?? null;
        case EUsersColumn.CreatedAt:
            return new Date(row.user.createdAt).getTime();
        case EUsersColumn.CharacterName:
            return row.character?.username.toLowerCase() ?? null;
        case EUsersColumn.CharacterCreatedAt:
            return row.character ? new Date(row.character.createdAt).getTime() : null;
        case EUsersColumn.CharacterStatus:
            return row.character ? getStatusWeight(row.character.status) : null;
    }
}
