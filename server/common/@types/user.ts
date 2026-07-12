import type { Prisma } from '~~/generated/prisma/client';

/**
 * Параметры фильтрации пользователя в `GET /api/user`.
 * Все поля опциональны — переданные объединяются по `AND`.
 * Значения приходят из query-строки, поэтому это строки.
 */
export interface IUserParams {
    /** Id пользователя (строка из query, приводится к числу). */
    id?: string;
    /** Discord-id привязанного аккаунта (поле связанной модели `DiscordAccount`). */
    discordId?: string;
    /** Discord-имя привязанного аккаунта. */
    discordName?: string;
    /** UUID персонажа пользователя. */
    characterUuid?: string;
    /** Имя персонажа. */
    characterName?: string;
}

/** Условие выборки пользователя, собираемое из {@link IUserParams}. */
export type TUserWhere = Prisma.UserWhereInput;
