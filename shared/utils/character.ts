import type { ICharacterItem, ICharacterParameters, ICharacterSkills } from '~~/shared/@types/character';

import { ITEMS, PARAMETER_CHEAP_VALUE, PARAMETER_EXPENSIVE_COST, PARAMETERS_DEFAULT_VALUE, SKILLS_DEFAULT_VALUE } from '~~/shared/constants/character';

/**
 * Считает, сколько очков суммарно стоит поднять параметр с нуля до значения.
 *
 * @param value Значение параметра.
 * @returns Стоимость в очках: до `PARAMETER_CHEAP_VALUE` — по одному за шаг, дальше — по `PARAMETER_EXPENSIVE_COST`.
 */
export function getParameterCost(value: number): number {
    const cheap = Math.min(value, PARAMETER_CHEAP_VALUE);
    const expensive = Math.max(0, value - PARAMETER_CHEAP_VALUE);

    return cheap + expensive * PARAMETER_EXPENSIVE_COST;
}

/**
 * Считает, сколько очков потрачено на набор параметров сверх стартовых значений.
 *
 * @param parameters Набор параметров персонажа.
 * @returns Потраченные очки из пула `MAX_PARAMETERS_POINTS`.
 */
export function getParametersSpent(parameters: ICharacterParameters): number {
    const keys = Object.keys(parameters) as (keyof ICharacterParameters)[];

    return keys.reduce((sum, key) => sum + getParameterCost(parameters[key]) - getParameterCost(PARAMETERS_DEFAULT_VALUE[key]), 0);
}

/**
 * Считает, сколько очков потрачено на набор навыков сверх стартовых значений.
 *
 * @param skills Набор навыков персонажа.
 * @returns Потраченные очки из пула `MAX_SKILLS_POINTS`.
 */
export function getSkillsSpent(skills: ICharacterSkills): number {
    const keys = Object.keys(skills) as (keyof ICharacterSkills)[];

    return keys.reduce((sum, key) => sum + skills[key] - SKILLS_DEFAULT_VALUE[key], 0);
}

/**
 * Считает, сколько монет стоят выбранные стартовые предметы.
 *
 * @param items Выбранные предметы.
 * @returns Потраченные монеты из пула `MAX_COINS`.
 */
export function getItemsSpent(items: ICharacterItem[]): number {
    return items.reduce((sum, item) => sum + (ITEMS.find(({ id }) => id === item.id)?.cost ?? 0), 0);
}
