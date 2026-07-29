import { BIOGRAPHY_MAX_HTML_LENGTH, BIOGRAPHY_MAX_LENGTH, CHARACTER_ERRORS } from '~~/server/common/constants/character';

/**
 * Готовит квенту к записи в БД: чистит присланный HTML по белому списку и
 * проверяет ограничения. Квента пишется пользователем в текстовом редакторе и
 * выводится через `v-html`, поэтому очистка обязательна на каждой ручке,
 * которая её сохраняет.
 *
 * Порядок важен: сначала дешёвая проверка объёма разметки, затем очистка, и
 * только потом проверки по видимому тексту — после очистки от него могло
 * не остаться ничего (например, если прислали одни скрипты).
 *
 * @param raw Значение поля `biography` из формы.
 * @returns Безопасный HTML для сохранения.
 * @throws `400` если квента пустая, состоит из одной разметки или слишком длинная.
 */
export function prepareBiography(raw: string): string {
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
