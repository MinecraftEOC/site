import type { Character, DiscordAccount, Skin } from '~~/generated/prisma/client';

/** Интерфейс персонажа */
export interface ICharacter extends Omit<Character, 'uuid' | 'password' | 'accessToken' | 'serverId' | 'createdAt' | 'updatedAt' | 'userId'> {
    skins: Omit<Skin, 'characterId'>[];
}

/** Интерфейс привязанного аккаунта Discord */
export interface IDiscordAccount extends Omit<DiscordAccount, 'userId' | 'verifyCode' | 'verifyExpiry'> {}
