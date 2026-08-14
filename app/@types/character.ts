import type { CharacterStatus } from '~~/generated/prisma/enums';
import type { TCharacterBody } from '~~/shared/schemas/character';
import type { ECharacterParameter, ECharacterSkill } from '~/assets/ts/enums/character';
import type { EColor } from '~/assets/ts/enums/common';

/** Навык в форме персонажа: подпись и подсказка к счётчику */
export interface ICharacterSkillItem {
    /** Подпись навыка */
    label: string;
    /** Ключ навыка в наборе характеристик */
    value: ECharacterSkill;
    /** Пояснение в тултипе */
    hint: string;
}

/** Параметр в форме персонажа вместе с навыками, которые от него зависят */
export interface ICharacterParameterItem {
    /** Подпись параметра */
    label: string;
    /** Ключ параметра в наборе характеристик */
    value: ECharacterParameter;
    /** Пояснение в тултипе */
    hint: string;
    /** Иконка слева от подписи */
    icon: string;
    /** Навыки параметра — выводятся списком под счётчиком */
    skills: ICharacterSkillItem[];
}

/** Данные формы персонажа: поля ручки плюс клиентские файлы скинов */
export type TCharacterForm = TCharacterBody & {
    /** Файлы скинов из инпута */
    skins: File[];
};

/** Кнопка смены статуса персонажа на админской деталке */
export interface ICharacterAdminAction {
    /** Подпись кнопки */
    label: string;
    /** Статус, в который переводится персонаж */
    status: CharacterStatus;
    /** Цветовая схема кнопки */
    color: EColor;
    /**
     * Что делать с замечаниями модерации: `true` — сохранить текст комментария,
     * `false` — очистить. Не задано — оставить как есть
     */
    review?: boolean;
}
