import type { TCharacterRow } from '~~/server/common/@types/character';
import type { ICharacter } from '~~/shared/@types/user';

import { BIOGRAPHY_MAX_HTML_LENGTH, BIOGRAPHY_MAX_LENGTH, CHARACTER_ERRORS } from '~~/server/common/constants/character';

/**
 * Приводит персонажа из Prisma к форме ответа API: даты — ISO-строки.
 *
 * @param character Персонаж в форме `CHARACTER_PUBLIC_SELECT`.
 * @returns Персонаж с датами-строками.
 */
export function toCharacterResponse(character: TCharacterRow): ICharacter {
    return {
        ...character,
        statusChangedAt: character.statusChangedAt.toISOString(),
    };
}

/**
 * Готовит квенту к записи в БД: чистит HTML по белому списку и проверяет
 * ограничения.
 *
 * @param raw Значение поля `biography` из формы.
 * @returns Безопасный HTML для сохранения.
 * @throws `400` если квента пустая, состоит из одной разметки или слишком длинная.
 */
export function prepareBiography(raw: string): string {
    // Объём разметки проверяется до очистки: она дорогая, а прислать могли
    // мегабайт вложенных тегов, в которых текста почти нет.
    if (raw.length > BIOGRAPHY_MAX_HTML_LENGTH) {
        throw createError({ statusCode: 400, message: CHARACTER_ERRORS.BIOGRAPHY_TOO_LONG });
    }

    const html = sanitizeRichText(raw);
    const text = getRichTextContent(html);

    if (!text) {
        throw createError({ statusCode: 400, message: CHARACTER_ERRORS.EMPTY_BIOGRAPHY });
    }

    if (text.length > BIOGRAPHY_MAX_LENGTH) {
        throw createError({ statusCode: 400, message: CHARACTER_ERRORS.BIOGRAPHY_TOO_LONG });
    }

    return html;
}
