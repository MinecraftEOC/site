import type { ITagItem } from '~/@types/tags';
import type { IUsersColumn } from '~/@types/user';

import { CHARACTER_STATUS_ICON, CHARACTER_STATUS_ORDER } from '~/assets/ts/constants/character';
import { CHARACTER_STATUS_LABEL, USERS_ADMIN } from '~/assets/ts/constants/content/account';
import { ESortDirection, EUsersColumn, EUsersFilter } from '~/assets/ts/enums/user';

/** Колонки таблицы игроков слева направо; сортировка доступна по каждой. */
export const USERS_COLUMNS: IUsersColumn[] = [
    { value: EUsersColumn.Id },
    { value: EUsersColumn.Discord },
    { value: EUsersColumn.CreatedAt },
    { value: EUsersColumn.CharacterName, divider: true },
    { value: EUsersColumn.CharacterCreatedAt },
    { value: EUsersColumn.CharacterStatus },
];

/** Теги фильтра таблицы: статусы персонажей плюс аккаунты вообще без персонажа. */
export const USERS_FILTERS: ITagItem[] = [
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

/** Иконка в заголовке колонки, по которой сейчас идёт сортировка. */
export const USERS_SORT_ICON: Record<ESortDirection, string> = {
    [ESortDirection.Asc]: 'arrow-up',
    [ESortDirection.Desc]: 'arrow-down',
};

/** Иконка в заголовке остальных колонок — намёк, что сортировать можно и по ним. */
export const USERS_SORT_IDLE_ICON = 'chevrons-up-down';
