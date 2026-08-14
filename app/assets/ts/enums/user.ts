/** Колонки таблицы игроков в админке — они же ключи сортировки. */
export enum EUsersColumn {
    /** Id пользователя. */
    Id = 'id',
    /** Ник в Discord. */
    Discord = 'discord',
    /** Дата регистрации аккаунта. */
    CreatedAt = 'createdAt',
    /** Имя персонажа. */
    CharacterName = 'characterName',
    /** Дата создания персонажа. */
    CharacterCreatedAt = 'characterCreatedAt',
    /** Статус персонажа. */
    CharacterStatus = 'characterStatus',
}

/** Направление сортировки таблицы игроков. */
export enum ESortDirection {
    /** По возрастанию. */
    Asc = 'asc',
    /** По убыванию. */
    Desc = 'desc',
}

/** Значения фильтра таблицы игроков, не являющиеся статусом персонажа. */
export enum EUsersFilter {
    /** Аккаунты, у которых персонажа нет вообще. */
    NoCharacter = 'no-character',
}
