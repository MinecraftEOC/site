/**
 * Машинные коды причин отказа при привязке Discord-аккаунта.
 *
 * Возвращаются из `linkDiscordByCode` в составе {@link TLinkResult} и служат
 * ключом к человекочитаемому тексту в `DISCORD_ERRORS`.
 */
export enum ELinkReasons {
    /** Код не найден, уже использован или протух. */
    INVALID_CODE = 'INVALID_CODE',
    /** Этот Discord уже привязан к другому аккаунту сайта. */
    DISCORD_TAKEN = 'DISCORD_TAKEN',
}
