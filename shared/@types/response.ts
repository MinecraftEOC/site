import type { DiscordLinkStatus, UserRole } from '~~/generated/prisma/client';
import type { ICharacter, IDiscordAccount, IServerCharacter } from '~~/shared/@types/user';

/** Ответ `POST /api/auth/register` — созданный пользователь без чувствительных полей. */
export interface IRegisterResponse {
    /** Id нового пользователя. */
    id: number;
    /** Email пользователя. */
    email: string;
    /** Момент создания аккаунта в ISO-формате. */
    createdAt: string;
}

/** Ответ `POST /api/auth/login` — базовые данные вошедшего пользователя. */
export interface ILoginResponse {
    /** Id пользователя. */
    id: number;
    /** Email пользователя. */
    email: string;
}

/** Ответ `GET /api/user` — пользователь по id. */
export interface IUserResponse {
    /** Id пользователя. */
    id: number;
    /** Email пользователя. */
    email: string;
    /** Роль пользователя (`USER`/`ADMIN`). */
    role: UserRole;
    /** Список персонажей пользователя. */
    characters: ICharacter[];
    /** Привязанный аккаунт Discord. */
    discordAccount: IDiscordAccount | null;
}

/** Ответ `GET /api/me` — текущий авторизованный пользователь. */
export interface IMeResponse extends IUserResponse {}

/** Ответ `POST`/`PATCH /api/character` — персонаж пользователя. */
export interface ICharacterResponse extends ICharacter {}

/** Универсальный ответ об успехе для операций без полезной нагрузки (logout, сброс пароля и т.п.). */
export interface ISuccessResponse {
    /** Признак успешного выполнения операции. */
    success: boolean;
}

/** Ответ `POST /api/discord/link` — одноразовый код привязки и момент его протухания. */
export interface IDiscordLinkResponse {
    /** Одноразовый код для команды `/verify`. */
    code: string;
    /** Момент протухания кода в ISO-формате. */
    expiresAt: string;
}

/** Ответ `GET /api/discord/status` — статус привязки Discord. */
export interface IDiscordStatusResponse {
    /** Статус привязки Discord. */
    status: DiscordLinkStatus;
}

/** Ответ `GET /api/server/character` — персонаж по uuid. Запрос для сервера */
export interface IServerCharacterResponse extends IServerCharacter {}

/** Ответ `GET /api/server/skins` — список хешей скинов. Запрос для сервера */
export interface IServerSkinsResponse {
    hashes: string[];
}
