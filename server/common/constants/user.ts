import type { Prisma } from '~~/generated/prisma/client';

/**
 * Единый `select` для выборки пользователя во всех ручках (`/api/me`,
 * `/api/user` и т.п.) — публичные поля профиля с персонажами и Discord-аккаунтом,
 * без чувствительных полей (пароль, токены). `satisfies` сохраняет литеральный
 * тип, чтобы Prisma корректно выводила форму результата.
 */
export const USER_PUBLIC_SELECT = {
    id: true,
    email: true,
    role: true,
    characters: {
        select: {
            id: true,
            username: true,
            biography: true,
            states: true,
            startingItems: true,
            status: true,
            skins: {
                select: {
                    id: true,
                    hash: true,
                },
            },
            comment: true,
        },
    },
    discordAccount: {
        select: {
            id: true,
            discordId: true,
            username: true,
            avatar: true,
            status: true,
        },
    },
} satisfies Prisma.UserSelect;
