import type { IOptions } from 'sanitize-html';

import MarkdownIt from 'markdown-it';
import sanitizeHtml from 'sanitize-html';

/**
 * Белый список HTML для контента из `.md`-файлов. Шире, чем у текстового
 * редактора: markdown-файлы пишет администрация, поэтому разрешены заголовки,
 * таблицы, картинки и блоки кода.
 *
 * Очистка нужна не от авторов, а от чужого HTML, который может приехать
 * вместе с текстом при копировании: `html: true` у markdown-it пропускает
 * сырую разметку как есть.
 */
export const MARKDOWN_SANITIZE_OPTIONS: IOptions = {
    allowedTags: [
        'p',
        'br',
        'hr',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'strong',
        'em',
        'u',
        's',
        'code',
        'pre',
        'blockquote',
        'ul',
        'ol',
        'li',
        'table',
        'thead',
        'tbody',
        'tr',
        'th',
        'td',
        'a',
        'img',
    ],

    allowedAttributes: {
        a: ['href', 'rel', 'target'],
        img: ['src', 'alt', 'title', 'loading', 'decoding'],
        th: ['align'],
        td: ['align'],
    },

    allowedSchemes: ['http', 'https', 'mailto'],

    transformTags: {
        a: (tagName, attribs) => {
            const href = attribs.href ?? '';

            // Внутренние ссылки остаются обычными: новая вкладка нужна только
            // для ухода с сайта
            if (href.startsWith('/') || href.startsWith('#')) {
                return { tagName, attribs };
            }

            return {
                tagName,
                attribs: { ...attribs, rel: 'noopener noreferrer', target: '_blank' },
            };
        },
    },
};

const markdown = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
});

const renderImage = markdown.renderer.rules.image!;

markdown.renderer.rules.image = (tokens, idx, options, env, self) => {
    tokens[idx]!.attrSet('loading', 'lazy');
    tokens[idx]!.attrSet('decoding', 'async');

    return renderImage(tokens, idx, options, env, self);
};

/**
 * Превращает markdown в безопасный HTML для вывода через `VMarkdown`.
 *
 * Модуль подключается и Vite-плагином на сборке (файлы из репозитория), и
 * ручками контента в рантайме (файлы из админки), поэтому импорты внутри —
 * только относительные и пакетные: алиасы Nuxt в конфиге сборки не работают.
 *
 * @param source Исходный текст `.md`-файла.
 * @returns Очищенная HTML-строка без пробелов по краям.
 */
export function renderMarkdown(source: string): string {
    return sanitizeHtml(markdown.render(source), MARKDOWN_SANITIZE_OPTIONS).trim();
}
