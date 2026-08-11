import type { Character, DiscordAccount, Skin } from '~~/generated/prisma/client';
import type { IUserResponse } from '~~/shared/@types/response';

/** Интерфейс пользователя */
export interface IUser extends IUserResponse {};

/** Интерфейс персонажа */
export interface ICharacter extends Omit<Character, 'uuid' | 'password' | 'accessToken' | 'serverId' | 'createdAt' | 'updatedAt' | 'userId' | 'statusChangedAt'> {
    createdAt: string;
    statusChangedAt: string;
    skins: Omit<Skin, 'characterId'>[];
}

/** Интерфейс привязанного аккаунта Discord */
export interface IDiscordAccount extends Omit<DiscordAccount, 'userId' | 'verifyCode' | 'verifyExpiry'> {}

/** Интерфейс персонажа для получения на сервере */
export interface IServerCharacter extends Pick<Character, 'uuid' | 'username' | 'states' | 'startingItems'> {}
