import type { UserRole } from '~~/generated/prisma/client';

/** Тело запросов входа/регистрации (`/api/auth/login`, `/api/auth/register`). */
export interface IAuthBody {
    /** Email пользователя. */
    email?: string;
    /** Пароль в открытом виде (хэшируется на сервере). */
    password?: string;
}

/** Тело запроса смены пароля по reset-токену (`/api/auth/reset-password`). */
export interface IResetPasswordBody {
    /** Одноразовый reset-токен из письма. */
    token?: string;
    /** Новый пароль в открытом виде. */
    password?: string;
}

/** Безопасное представление пользователя без чувствительных полей (хэша пароля и т.п.). */
export interface ISafeUser {
    /** Идентификатор пользователя. */
    id: number;
    /** Email пользователя. */
    email: string;
    /** Роль пользователя (`USER`/`ADMIN`). */
    role: UserRole;
}

/** Данные текущей сессии, положенные middleware в `event.context.session`. */
export interface ISessionContext {
    /** Id сессии (секрет из cookie). */
    id: string;
    /** Момент протухания сессии. */
    expiresAt: Date;
}

declare module 'h3' {
    interface H3EventContext {
        user?: ISafeUser;
        session?: ISessionContext;
    }
}
