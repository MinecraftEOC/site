/** Тексты ошибок авторизации, возвращаемые эндпоинтами через `createError`. */
export const AUTH_STATUSES = {
    INVALID_EMAIL: 'Некорректный email',
    INVALID_PASSWORD: 'Пароль должен быть не короче 8 символов',
    USER_EXISTS: 'Пользователь с таким email уже существует',
    EMPTY_EMAIL: 'Email не может быть пустым',
    EMPTY_PASSWORD: 'Пароль не может быть пустым',
    EMPTY_RESET_TOKEN: 'Токен не может быть пустым',
    INVALID_DATA: 'Неверный email или пароль',
    INVALID_RESET_TOKEN: 'Неверный токен',
    UNAUTHORIZED: 'Требуется авторизация',
    USER_NOT_FOUND: 'Пользователь не найден',
};

/** Имя httpOnly-cookie, в которой хранится id сессии. */
export const SESSION_COOKIE = 'sessionid';

/** Срок жизни сессии, секунды (7 дней). */
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

/** Срок жизни reset-токена восстановления пароля, секунды (1 час). */
export const RESET_TOKEN_MAX_AGE = 60 * 60;
