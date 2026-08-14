import type { ITagItem, TTagValue } from '~/@types/tags';
import type { IUsersColumn } from '~/@types/user';

import { CHARACTER_STATUS_ICON, CHARACTER_STATUS_ORDER } from '~/assets/ts/constants/character';
import { CHARACTER_STATUS_LABEL, USERS_ADMIN } from '~/assets/ts/constants/content/account';
import { ESortDirection, EUsersColumn, EUsersFilter } from '~/assets/ts/enums/user';

/**
 * Колонки таблицы игроков слева направо; сортировка доступна по каждой.
 * Ширины заданы явно и в сумме дают 100%: раскладка таблицы фиксированная,
 * иначе колонки прыгали бы при каждой смене фильтра вслед за содержимым.
 */
export const USERS_COLUMNS: IUsersColumn[] = [
    { value: EUsersColumn.Id, width: '6%' },
    { value: EUsersColumn.Email, width: '23%' },
    { value: EUsersColumn.Discord, width: '19%' },
    { value: EUsersColumn.CreatedAt, width: '11%' },
    { value: EUsersColumn.CharacterName, width: '19%', divider: true },
    { value: EUsersColumn.CharacterCreatedAt, width: '10%' },
    { value: EUsersColumn.CharacterStatus, width: '12%' },
];

/** Теги фильтра таблицы: отбор аккаунтов по краям, статусы персонажей в середине. */
export const USERS_FILTERS: ITagItem[] = [
    {
        value: EUsersFilter.DiscordLinked,
        label: USERS_ADMIN.discordFilter,
        icon: 'simple-icons:discord',
    },
    ...CHARACTER_STATUS_ORDER.map(status => ({
        value: status,
        label: CHARACTER_STATUS_LABEL[status],
        icon: CHARACTER_STATUS_ICON[status],
    })),
    {
        value: EUsersFilter.NoCharacter,
        label: USERS_ADMIN.noCharacterFilter,
        icon: 'user-round-x',
    },
];

/**
 * Теги, отбирающие аккаунты, а не персонажей: в фильтрации они обрабатываются
 * отдельно, всё остальное в модели фильтра — статусы персонажа.
 */
export const USERS_ACCOUNT_FILTERS: TTagValue[] = Object.values(EUsersFilter);

/** Фильтр, выбранный при открытии страницы: игроки без Discord до игры не доходят. */
export const USERS_DEFAULT_FILTERS: TTagValue[] = [EUsersFilter.DiscordLinked];

/** Иконка в заголовке колонки, по которой сейчас идёт сортировка. */
export const USERS_SORT_ICON: Record<ESortDirection, string> = {
    [ESortDirection.Asc]: 'arrow-up',
    [ESortDirection.Desc]: 'arrow-down',
};

/** Иконка в заголовке остальных колонок — намёк, что сортировать можно и по ним. */
export const USERS_SORT_IDLE_ICON = 'chevrons-up-down';
