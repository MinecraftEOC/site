import sanitizeHtml from 'sanitize-html';

import { PLAIN_TEXT_SANITIZE_OPTIONS, RICH_TEXT_SANITIZE_OPTIONS } from '~~/server/common/constants/sanitize';

/**
 * Очищает HTML из текстового редактора по белому списку. Вызывать обязательно
 * на сервере перед записью в БД: сохранённый текст выводится через `v-html`.
 *
 * @param html Сырой HTML из запроса.
 * @returns HTML, безопасный для вывода.
 */
export function sanitizeRichText(html: string): string {
    return sanitizeHtml(html, RICH_TEXT_SANITIZE_OPTIONS).trim();
}

/**
 * Возвращает видимый текст без разметки: длину считаем по символам, которые
 * видит пользователь, а не по тегам.
 *
 * @param html HTML-строка.
 * @returns Текст без тегов, без пробелов по краям.
 */
export function getRichTextContent(html: string): string {
    return sanitizeHtml(html, PLAIN_TEXT_SANITIZE_OPTIONS).trim();
}
