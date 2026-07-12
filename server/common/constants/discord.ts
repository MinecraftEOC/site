/**
 * Тексты ответов, связанных с привязкой Discord: ошибки эндпоинта
 * `/api/discord/link` и сообщения бота на команду `/verify`.
 * Ключи `INVALID_CODE`/`DISCORD_TAKEN` совпадают со значениями {@link ELinkReasons}.
 */
export const DISCORD_ERRORS = {
    ALREADY_LINKED: 'Discord уже привязан к этому аккаунту',
    LINK_SUCCESS: 'Аккаунт успешно привязан',
    INVALID_CODE: 'Код неверный или устарел',
    DISCORD_TAKEN: 'Этот Discord уже привязан к другому аккаунту',
    WRONG_CHANNEL: 'Команда доступна только в канале верификации',
    INTERNAL_ERROR: 'Что-то пошло не так, попробуйте ещё раз',
};

/** Срок жизни кода привязки, секунды (10 минут). */
export const VERIFY_CODE_TTL = 60 * 10;

/** Длина генерируемого кода привязки. */
export const VERIFY_CODE_LENGTH = 10;

/** Алфавит кода привязки — без визуально похожих символов (0/O, 1/I/L и т.п.). */
export const VERIFY_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/** Имя slash-команды бота для привязки аккаунта. */
export const VERIFY_COMMAND_NAME = 'verify';
