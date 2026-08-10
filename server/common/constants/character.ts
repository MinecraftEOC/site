import type { Prisma } from '~~/generated/prisma/client';

/**
 * Тексты ошибок ручек персонажа, возвращаемые через `createError`. Проверки
 * самих полей формы живут в схеме — там же и их тексты
 * (`CHARACTER_FORM_ERRORS`).
 */
export const CHARACTER_ERRORS = {
    ALREADY_EXISTS: 'У вас уже есть активный персонаж',
    DISCORD_NOT_LINKED: 'Для создания персонажа нужно привязать Discord',
    NOT_EDITABLE: 'Нет персонажа, доступного для редактирования',
    NOTHING_TO_UPDATE: 'Не передано ни одного поля для обновления',
    USERNAME_TAKEN: 'Имя персонажа уже занято',
    INVALID_STATUS: 'Некорректный статус персонажа',
    NOT_FOUND: 'Персонаж не найден',
    EMPTY_ID: 'ID персонажа не задан',
    EMPTY_UUID: 'UUID персонажа не задан',
};

/**
 * Публичный `select` персонажа — поля профиля со скинами и данными о статусе,
 * без служебных (`uuid`, `password`, `accessToken`, `serverId`, `createdAt`,
 * `updatedAt`). Совпадает с формой {@link ICharacter} с точностью до
 * сериализации дат (см. `toCharacterResponse`). `satisfies` сохраняет
 * литеральный тип для вывода Prisma.
 */
export const CHARACTER_PUBLIC_SELECT = {
    id: true,
    username: true,
    biography: true,
    states: true,
    startingItems: true,
    status: true,
    statusChangedAt: true,
    statusComment: true,
    reviewComment: true,
    skins: {
        select: {
            id: true,
            hash: true,
        },
    },
} satisfies Prisma.CharacterSelect;
