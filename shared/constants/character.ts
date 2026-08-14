import type { ICharacterParameters, ICharacterSkills, ICharacterStartingItem } from '~~/shared/@types/character';

import { CharacterStatus } from '~~/generated/prisma/enums';

/** Имена полей `multipart/form-data` в ручках создания и правки персонажа. */
export const CHARACTER_FORM_FIELDS = {
    username: 'username',
    biography: 'biography',
    states: 'states',
    startingItems: 'startingItems',
} as const;

/**
 * Регулярка имени персонажа: слова кириллицей через пробел, каждое не короче
 * двух символов, всё имя — не длиннее 16. Заглавная обязательна только у
 * первого слова: дальше идут фамилии с приставками («Лео де Бонарт»). Буквы
 * заданы кодами (А–Я и А–я плюс Ё и ё): в буквенном виде диапазоны ругает
 * `regexp/no-obscure-range`.
 */
export const USERNAME_REGEX = /^(?=.{5,16}$)[\u0410-\u042F\u0401][\u0410-\u044F\u0401\u0451]+( [\u0410-\u044F\u0401\u0451]{2,})+$/;

/** Максимальная длина квенты по видимому тексту, без учёта разметки. */
export const BIOGRAPHY_MAX_LENGTH = 10000;

/**
 * Жёсткий предел на размер присланной разметки квенты. Проверяется до очистки:
 * защищает от мегабайтных «бомб» из вложенных тегов, в которых почти нет текста.
 */
export const BIOGRAPHY_MAX_HTML_LENGTH = 100000;

/** Пул очков на параметры сверх стартовых значений. */
export const MAX_PARAMETERS_POINTS = 25;

/** Пул очков на навыки сверх стартовых значений. */
export const MAX_SKILLS_POINTS = 50;

/** Потолок одного параметра. */
export const MAX_PARAMETER_VALUE = 10;

/** Потолок одного навыка. */
export const MAX_SKILL_VALUE = 10;

/** Значение параметра, начиная с которого шаг стоит дороже. */
export const PARAMETER_CHEAP_VALUE = 7;

/** Стоимость шага параметра выше {@link PARAMETER_CHEAP_VALUE}. */
export const PARAMETER_EXPENSIVE_COST = 2;

/** Пул монет на стартовые предметы. */
export const MAX_COINS = 640;

/** Минимум монет, который нужно потратить на стартовые предметы — половина пула. */
export const MIN_ITEMS_SPENT = MAX_COINS / 2;

/** Стартовые значения параметров: ниже них персонаж опуститься не может. */
export const PARAMETERS_DEFAULT_VALUE: ICharacterParameters = {
    int: 1,
    agility: 1,
    const: 1,
    reaction: 1,
    craft: 1,
};

/** Стартовые значения навыков: ниже них персонаж опуститься не может. */
export const SKILLS_DEFAULT_VALUE: ICharacterSkills = {
    trade: 0,
    management: 0,
    education: 0,
    dexterity: 0,
    shooting: 0,
    athletics: 0,
    resistance: 0,
    strength: 0,
    melee: 0,
    sword: 0,
    shaft_weapon: 0,
    blades: 0,
    evasion: 0,
    farming: 0,
    hunting: 0,
    carpentry: 0,
    blacksmithing: 0,
    mining: 0,
};

/** Каталог стартовых предметов: цены и наборы, из которых собирается инвентарь. */
export const ITEMS = [
    { id: '1001', label: 'Походный нож', cost: 60, quantity: 1, icon: 'sword' },
    { id: '1002', label: 'Факел', cost: 24, quantity: 3, icon: 'flame' },
    { id: '1003', label: 'Яблоко', cost: 16, quantity: 1, icon: 'apple' },
    { id: '1004', label: 'Карта местности', cost: 200, quantity: 1, icon: 'map' },
    { id: '1005', label: 'Набор ремесленника', cost: 220, quantity: 1, icon: 'hammer' },
    { id: '1006', label: 'Кирка', cost: 20, quantity: 1, icon: 'pickaxe' },
    { id: '1007', label: 'Верёвка', cost: 8, quantity: 1, icon: 'package' },
    { id: '1008', label: 'Бинты', cost: 10, quantity: 1, icon: 'heart-pulse' },
    { id: '1009', label: 'Компас', cost: 40, quantity: 1, icon: 'compass' },
    { id: '1010', label: 'Фляга воды', cost: 30, quantity: 1, icon: 'droplets' },
    { id: '1011', label: 'Спальный мешок', cost: 16, quantity: 1, icon: 'bed' },
    { id: '1012', label: 'Набор писаря', cost: 120, quantity: 1, icon: 'feather' },
] as const satisfies readonly ICharacterStartingItem[];

/**
 * Статусы, в которых персонаж выведен из игры: он больше не считается «живым»,
 * не мешает создать нового и не участвует в поиске текущего персонажа.
 */
export const CHARACTER_RETIRED_STATUSES: CharacterStatus[] = [CharacterStatus.DEAD, CharacterStatus.UNAVAILABLE];

/** Статусы, в которых пользователь может редактировать своего персонажа. */
export const CHARACTER_EDITABLE_STATUSES: CharacterStatus[] = [CharacterStatus.UNVERIFIED, CharacterStatus.RETURNED];

/**
 * Статусы, в которые персонажа переводят без обязательного комментария:
 * одобренная заявка понятна игроку и без пояснений.
 */
export const CHARACTER_COMMENT_OPTIONAL_STATUSES: CharacterStatus[] = [CharacterStatus.ACTIVE];

/** Максимальная длина комментария администрации по видимому тексту, без учёта разметки. */
export const STATUS_COMMENT_MAX_LENGTH = 2000;

/** Жёсткий предел на размер присланной разметки комментария администрации. */
export const STATUS_COMMENT_MAX_HTML_LENGTH = 20000;

/**
 * Занимает ли персонаж слот игрока. Считается от {@link CHARACTER_RETIRED_STATUSES},
 * как и на бэке: новый статус в enum по умолчанию трактуется как «живой»
 * одинаково на обеих сторонах.
 *
 * @param status Статус персонажа.
 * @returns `true`, если персонаж не выведен из игры.
 */
export function isCharacterLive(status: CharacterStatus): boolean {
    return !CHARACTER_RETIRED_STATUSES.includes(status);
}
