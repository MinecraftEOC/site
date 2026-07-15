import type { Prisma } from '~~/generated/prisma/client';

import { CharacterStatus } from '~~/generated/prisma/enums';

/** Тексты ошибок ручек персонажа, возвращаемые через `createError`. */
export const CHARACTER_ERRORS = {
    ALREADY_EXISTS: 'У вас уже есть активный персонаж',
    NOT_EDITABLE: 'Нет персонажа, доступного для редактирования',
    NOTHING_TO_UPDATE: 'Не передано ни одного поля для обновления',
    USERNAME_TAKEN: 'Имя персонажа уже занято',
    INVALID_USERNAME: 'Некорректное имя персонажа',
    EMPTY_BIOGRAPHY: 'Квента не задана',
    EMPTY_STATES: 'Поле states не задано',
    EMPTY_STARTING_ITEMS: 'Поле startingItems не задано',
    INVALID_STATES: 'Поле states имеет некорректный формат',
    INVALID_STARTING_ITEMS: 'Поле startingItems имеет некорректный формат',
    INVALID_STATUS: 'Некорректный статус персонажа',
    NOT_FOUND: 'Персонаж не найден',
    EMPTY_ID: 'ID персонажа не задан',
    EMPTY_UUID: 'UUID персонажа не задан',
};

/**
 * Публичный `select` персонажа — поля профиля со скинами, без служебных
 * (`uuid`, `password`, `accessToken`, `serverId`, даты). Совпадает с формой
 * {@link ICharacter}. `satisfies` сохраняет литеральный тип для вывода Prisma.
 */
export const CHARACTER_PUBLIC_SELECT = {
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
} satisfies Prisma.CharacterSelect;

/** Статусы, в которых пользователь может редактировать своего персонажа. */
export const CHARACTER_EDITABLE_STATUSES: CharacterStatus[] = [CharacterStatus.UNVERIFIED, CharacterStatus.RETURNED];

/** Регулярка имени персонажа: 3–16 символов, кириллица и пробелы (не по краям). */
export const USERNAME_REGEX = /^[а-яёА-ЯЁ][а-яёА-ЯЁ ]{1,14}[а-яёА-ЯЁ]$/;
