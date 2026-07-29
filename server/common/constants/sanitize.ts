import type { IOptions } from 'sanitize-html';

/**
 * Белый список HTML для текста из редактора (`VEditor` на Quill). Состав
 * повторяет тулбар редактора: начертания, подзаголовки, списки и ссылки.
 * Всё остальное — теги, атрибуты, стили, `data-*` — вырезается.
 *
 * Списки: Quill 2 размечает оба вида списков тегом `ol`, а вид хранит в
 * атрибуте `data-list` у `li`, поэтому атрибут обязан пережить очистку —
 * иначе маркированный список превратится в нумерованный.
 *
 * Ссылки: схемы ограничены (`javascript:` не пройдёт), к внешним ссылкам
 * принудительно добавляются `rel` и `target` — за них отвечает автор
 * контента, а не мы.
 */
export const RICH_TEXT_SANITIZE_OPTIONS: IOptions = {
    allowedTags: ['p', 'br', 'strong', 'em', 'u', 's', 'h2', 'h3', 'ol', 'ul', 'li', 'a'],

    // `rel` и `target` проставляет transformTags, но фильтр атрибутов работает
    // после него — без них в списке они бы вырезались обратно
    allowedAttributes: {
        a: ['href', 'rel', 'target'],
        li: ['data-list'],
    },

    allowedSchemes: ['http', 'https', 'mailto'],

    // Служебная вёрстка Quill (span.ql-ui внутри пунктов списка) в базе не нужна:
    // тег вырезается, редактор дорисует его сам при следующем открытии
    nonTextTags: ['style', 'script', 'textarea', 'option', 'noscript'],

    transformTags: {
        a: (tagName, attribs) => ({
            tagName,
            attribs: {
                ...attribs,
                rel: 'noopener noreferrer nofollow',
                target: '_blank',
            },
        }),
    },
};

/** Опции для извлечения голого текста: вырезается вся разметка. */
export const PLAIN_TEXT_SANITIZE_OPTIONS: IOptions = {
    allowedTags: [],
    allowedAttributes: {},
};
