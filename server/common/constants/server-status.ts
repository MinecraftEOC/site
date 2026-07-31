/** Версия протокола Minecraft, отправляемая в handshake (1.12.2). */
export const MINECRAFT_PROTOCOL_VERSION = 340;

/** Id пакета handshake в Server List Ping. */
export const HANDSHAKE_PACKET_ID = 0x00;

/** Id пакета запроса и ответа статуса — в состоянии status оба нулевые. */
export const STATUS_PACKET_ID = 0x00;

/** Значение поля `next state` в handshake для запроса статуса. */
export const HANDSHAKE_NEXT_STATE_STATUS = 1;

/** Максимальная длина VarInt в байтах. */
export const VARINT_MAX_BYTES = 5;

/** Таймаут ожидания ответа игрового сервера, мс. */
export const STATUS_PING_TIMEOUT = 3000;

/** Время жизни закэшированного статуса, мс. */
export const STATUS_CACHE_TTL = 30_000;

/** Предел размера ответа сервера, байты — защита от бесконечного накопления мусора в сокете. */
export const STATUS_MAX_RESPONSE_SIZE = 64 * 1024;

/** Тексты ошибок пинга. Наружу не отдаются — только в лог. */
export const STATUS_ERRORS = {
    TIMEOUT: 'Игровой сервер не ответил вовремя',
    CLOSED: 'Игровой сервер закрыл соединение',
    MALFORMED_VARINT: 'Некорректный VarInt в ответе сервера',
    UNEXPECTED_PACKET: 'Неожиданный id пакета в ответе сервера',
    RESPONSE_TOO_LARGE: 'Ответ сервера превысил допустимый размер',
};
