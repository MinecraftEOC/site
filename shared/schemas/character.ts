import { z } from 'zod';

import {
    BIOGRAPHY_MAX_HTML_LENGTH,
    BIOGRAPHY_MAX_LENGTH,
    ITEMS,
    MAX_COINS,
    MAX_PARAMETER_VALUE,
    MAX_PARAMETERS_POINTS,
    MAX_SKILL_VALUE,
    MAX_SKILLS_POINTS,
    MIN_ITEMS_SPENT,
    PARAMETERS_DEFAULT_VALUE,
    SKILLS_DEFAULT_VALUE,
    USERNAME_REGEX,
} from '~~/shared/constants/character';
import { getItemsSpent, getParametersSpent, getSkillsSpent } from '~~/shared/utils/character';
import { hasRichText, stripRichText } from '~~/shared/utils/editor';

/**
 * Тексты ошибок формы персонажа. Уходят и в уведомление на фронте, и в ответ
 * ручки, поэтому каждый должен читаться сам по себе, без привязки к блоку формы.
 */
export const CHARACTER_FORM_ERRORS = {
    USERNAME_REQUIRED: 'Укажите имя персонажа',
    USERNAME_INVALID: 'Имя персонажа — до 16 символов: кириллица, имя с заглавной буквы и фамилия через пробел',
    BIOGRAPHY_REQUIRED: 'Расскажите историю персонажа',
    BIOGRAPHY_TOO_LONG: `Квента не должна быть длиннее ${BIOGRAPHY_MAX_LENGTH} символов`,
    BIOGRAPHY_HTML_TOO_LONG: 'Оформление квенты слишком объёмное — упростите разметку',
    STATES_INVALID: 'Некорректные параметры или навыки',
    STATES_NOT_DISTRIBUTED: 'Распределите все очки параметров и навыков',
    STARTING_ITEMS_INVALID: 'Некорректные стартовые предметы',
    STARTING_ITEMS_DUPLICATED: 'Каждый предмет можно выбрать только один раз',
    STARTING_ITEMS_NOT_ENOUGH: `Выберите предметы минимум на ${MIN_ITEMS_SPENT} монет`,
    STARTING_ITEMS_TOO_EXPENSIVE: `Предметы не должны стоить дороже ${MAX_COINS} монет`,
};

/**
 * Собирает схему набора характеристик: ключи и нижние границы берутся из
 * стартовых значений, верхняя — общая для набора.
 *
 * @param defaults Стартовые значения набора.
 * @param max Потолок одного значения.
 * @returns Схема объекта с теми же ключами.
 */
function toStatesSchema<T extends object>(defaults: T, max: number) {
    const shape = Object.fromEntries(
        Object.entries(defaults).map(([key, min]) => [
            key,
            z
                .number({
                    required_error: CHARACTER_FORM_ERRORS.STATES_INVALID,
                    invalid_type_error: CHARACTER_FORM_ERRORS.STATES_INVALID,
                })
                .int(CHARACTER_FORM_ERRORS.STATES_INVALID)
                .min(min, CHARACTER_FORM_ERRORS.STATES_INVALID)
                .max(max, CHARACTER_FORM_ERRORS.STATES_INVALID),
        ]),
    ) as { [K in keyof T]: z.ZodNumber };

    return z.object(shape, {
        required_error: CHARACTER_FORM_ERRORS.STATES_INVALID,
        invalid_type_error: CHARACTER_FORM_ERRORS.STATES_INVALID,
    });
}

/** Поле имени персонажа: обязательность и формат. */
const usernameField = z
    .string({ required_error: CHARACTER_FORM_ERRORS.USERNAME_REQUIRED })
    .trim()
    .min(1, CHARACTER_FORM_ERRORS.USERNAME_REQUIRED)
    .regex(USERNAME_REGEX, CHARACTER_FORM_ERRORS.USERNAME_INVALID);

/**
 * Поле квенты. Объём разметки проверяется первым: очистка на сервере дорогая,
 * а прислать могли мегабайт вложенных тегов, в которых текста почти нет.
 */
const biographyField = z
    .string({ required_error: CHARACTER_FORM_ERRORS.BIOGRAPHY_REQUIRED })
    .trim()
    .max(BIOGRAPHY_MAX_HTML_LENGTH, CHARACTER_FORM_ERRORS.BIOGRAPHY_HTML_TOO_LONG)
    .refine(hasRichText, CHARACTER_FORM_ERRORS.BIOGRAPHY_REQUIRED)
    .refine(html => stripRichText(html).length <= BIOGRAPHY_MAX_LENGTH, CHARACTER_FORM_ERRORS.BIOGRAPHY_TOO_LONG);

/** Поле характеристик: значения в допустимых границах и полностью распределённые пулы. */
const statesField = z
    .object(
        {
            parameters: toStatesSchema(PARAMETERS_DEFAULT_VALUE, MAX_PARAMETER_VALUE),
            skills: toStatesSchema(SKILLS_DEFAULT_VALUE, MAX_SKILL_VALUE),
        },
        {
            required_error: CHARACTER_FORM_ERRORS.STATES_INVALID,
            invalid_type_error: CHARACTER_FORM_ERRORS.STATES_INVALID,
        },
    )
    .refine(
        states => getParametersSpent(states.parameters) === MAX_PARAMETERS_POINTS
            && getSkillsSpent(states.skills) === MAX_SKILLS_POINTS,
        CHARACTER_FORM_ERRORS.STATES_NOT_DISTRIBUTED,
    );

/** Поле стартовых предметов: только уникальные предметы каталога и трата в пределах пула монет. */
const startingItemsField = z
    .array(
        z
            .object({
                id: z.string({ required_error: CHARACTER_FORM_ERRORS.STARTING_ITEMS_INVALID }),
                quantity: z.number({ required_error: CHARACTER_FORM_ERRORS.STARTING_ITEMS_INVALID }).int(),
            })
            .refine(
                item => ITEMS.some(({ id, quantity }) => id === item.id && quantity === item.quantity),
                CHARACTER_FORM_ERRORS.STARTING_ITEMS_INVALID,
            ),
        { required_error: CHARACTER_FORM_ERRORS.STARTING_ITEMS_INVALID, invalid_type_error: CHARACTER_FORM_ERRORS.STARTING_ITEMS_INVALID },
    )
    .max(ITEMS.length, CHARACTER_FORM_ERRORS.STARTING_ITEMS_INVALID)
    .refine(
        items => new Set(items.map(item => item.id)).size === items.length,
        CHARACTER_FORM_ERRORS.STARTING_ITEMS_DUPLICATED,
    )
    .refine(items => getItemsSpent(items) <= MAX_COINS, CHARACTER_FORM_ERRORS.STARTING_ITEMS_TOO_EXPENSIVE)
    .refine(items => getItemsSpent(items) >= MIN_ITEMS_SPENT, CHARACTER_FORM_ERRORS.STARTING_ITEMS_NOT_ENOUGH);

/**
 * Схема полей персонажа для `POST /api/character` — без скинов: они приходят
 * файлами и проверяются отдельно.
 */
export const sharedCharacterSchema = z.object({
    username: usernameField,
    biography: biographyField,
    states: statesField,
    startingItems: startingItemsField,
});

/** Схема полей `PATCH /api/character`: любое подмножество полей персонажа. */
export const sharedCharacterUpdateSchema = sharedCharacterSchema.partial();

/** Тип валидных полей персонажа. */
export type TCharacterBody = z.infer<typeof sharedCharacterSchema>;

/** Тип валидных полей правки персонажа. */
export type TCharacterUpdateBody = z.infer<typeof sharedCharacterUpdateSchema>;
