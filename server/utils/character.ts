import type { MultiPartData } from 'h3';
import type { ZodSchema } from 'zod';
import type { TCharacterRow } from '~~/server/common/@types/character';
import type { ICharacterItem, ICharacterStates } from '~~/shared/@types/character';
import type { ICharacter } from '~~/shared/@types/user';

import { BIOGRAPHY_MAX_LENGTH, CHARACTER_FORM_FIELDS } from '~~/shared/constants/character';
import { CHARACTER_FORM_ERRORS } from '~~/shared/schemas/character';

/**
 * Приводит персонажа из Prisma к форме ответа API: даты — ISO-строки.
 *
 * @param character Персонаж в форме `CHARACTER_PUBLIC_SELECT`.
 * @returns Персонаж с датами-строками.
 */
export function toCharacterResponse(character: TCharacterRow): ICharacter {
    return {
        ...character,
        createdAt: character.createdAt.toISOString(),
        statusChangedAt: character.statusChangedAt.toISOString(),
        // В БД это Json, и Prisma отдаёт их широким `JsonValue`. Структуру
        // гарантирует схема, которой поля проверены перед записью.
        states: character.states as unknown as ICharacterStates,
        startingItems: character.startingItems as unknown as ICharacterItem[],
    };
}

/**
 * Собирает поля персонажа из multipart-запроса и валидирует их общей схемой.
 *
 * @param parts Части multipart-запроса.
 * @param schema Схема полей: полная при создании, частичная при правке.
 * @returns Провалидированные поля персонажа.
 * @throws `400` с текстом первой ошибки схемы или при невалидном JSON.
 */
export function parseCharacterFormOr400<T>(parts: MultiPartData[] | undefined, schema: ZodSchema<T>): T {
    return unwrapSafeParseOr400(schema.safeParse({
        username: getFormField(parts, CHARACTER_FORM_FIELDS.username),
        biography: getFormField(parts, CHARACTER_FORM_FIELDS.biography),
        states: getFormJson(parts, CHARACTER_FORM_FIELDS.states, CHARACTER_FORM_ERRORS.STATES_INVALID),
        startingItems: getFormJson(parts, CHARACTER_FORM_FIELDS.startingItems, CHARACTER_FORM_ERRORS.STARTING_ITEMS_INVALID),
    }));
}

/**
 * Готовит квенту к записи в БД: чистит HTML по белому списку и проверяет
 * ограничения по видимому тексту.
 *
 * @param raw Провалидированное значение поля `biography`.
 * @returns Безопасный HTML для сохранения.
 * @throws `400` если после очистки не осталось текста или он слишком длинный.
 */
export function prepareBiography(raw: string): string {
    const html = sanitizeRichText(raw);
    const text = getRichTextContent(html);

    if (!text) {
        throw createError({ statusCode: 400, message: CHARACTER_FORM_ERRORS.BIOGRAPHY_REQUIRED });
    }

    if (text.length > BIOGRAPHY_MAX_LENGTH) {
        throw createError({ statusCode: 400, message: CHARACTER_FORM_ERRORS.BIOGRAPHY_TOO_LONG });
    }

    return html;
}
