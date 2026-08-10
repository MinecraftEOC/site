import type { TCharacterBody } from '~~/shared/schemas/character';
import type { ECharacterParameter, ECharacterSkill } from '~/assets/ts/enums/character';

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
