import type { ELinkReasons } from '~~/server/common/enums/discord';

/** Данные Discord-пользователя, которые бот передаёт в `linkDiscordByCode` при привязке. */
export interface IDiscordUserData {
    /** Snowflake-id пользователя Discord. */
    id: string;
    /** Ник пользователя Discord. */
    username: string;
    /** URL аватара или `null`, если недоступен. */
    avatar: string | null;
}

/**
 * Результат попытки привязки по коду (используется ботом в `/verify`).
 * Либо успех с ником, либо отказ с машинным кодом причины {@link ELinkReasons}.
 */
export type TLinkResult = { ok: true; username: string } | { ok: false; reason: ELinkReasons };
