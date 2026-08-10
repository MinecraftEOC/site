/**
 * Видимый текст HTML-разметки из редактора. Работает регэкспом, поэтому годится
 * и в браузере: на сервере точность даёт `getRichTextContent` на sanitize-html.
 *
 * @param html Разметка из `VEditor`.
 * @returns Текст без тегов и неразрывных пробелов, обрезанный по краям.
 */
export function stripRichText(html: string): string {
    return html
        .replace(/<[^>]*>/g, ' ')
        .replace(/&nbsp;/gi, ' ')
        // Пробелы вместо тегов схлопываются: иначе размеченный текст считается
        // длиннее, чем его же насчитает `getRichTextContent` на сервере.
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Есть ли в разметке из редактора хоть какой-то текст.
 *
 * @param html Разметка из `VEditor`.
 * @returns `true`, если после снятия тегов остались непробельные символы.
 */
export function hasRichText(html: string): boolean {
    return stripRichText(html).length > 0;
}
