/** Тексты ошибок авторизации, возвращаемые эндпоинтами через `createError`. */
export const AUTH_ERRORS = {
    INVALID_EMAIL: 'Некорректный email',
    INVALID_PASSWORD: 'Пароль должен быть не короче 8 символов',
    EMPTY_EMAIL: 'Email не задан',
    EMPTY_PASSWORD: 'Пароль не задан',
    EMPTY_RESET_TOKEN: 'Токен не задан',
    INVALID_DATA: 'Неверный email или пароль',
    INVALID_RESET_TOKEN: 'Неверный токен',
    UNAUTHORIZED: 'Требуется авторизация',
    FORBIDDEN: 'Доступ запрещен',
    SERVER_TOKEN_NOT_CONFIGURED: 'Серверный токен не настроен',
};

/** Имя httpOnly-cookie, в которой хранится id сессии. */
export const SESSION_COOKIE = 'sessionid';

/** Схема HTTP-заголовка `Authorization` для server-to-server токена. */
export const SERVER_TOKEN_SCHEME = 'Bearer ';

/** Префикс пути ручек, доступных только игровому серверу по общему токену. */
export const SERVER_API_PREFIX = '/api/server';

/** Срок жизни сессии, секунды (7 дней). */
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

/** Срок жизни reset-токена восстановления пароля, секунды (1 час). */
export const RESET_TOKEN_MAX_AGE = 60 * 60;
