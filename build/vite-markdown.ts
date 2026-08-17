import type { IOptions } from 'sanitize-html';
import type { Plugin } from 'vite';

import MarkdownIt from 'markdown-it';
import sanitizeHtml from 'sanitize-html';

/**
 * Белый список HTML для контента из `.md`-файлов. Шире, чем у текстового
 * редактора: разметку пишут разработчики в репозитории, поэтому разрешены
 * заголовки, таблицы, картинки и блоки кода.
 *
 * Очистка нужна не от авторов, а от чужого HTML, который может приехать
 * вместе с текстом при копировании: `html: true` у markdown-it пропускает
 * сырую разметку как есть.
 */
const MARKDOWN_SANITIZE_OPTIONS: IOptions = {
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

/** Пути картинок, которые отдаются сборщику: относительные и через алиасы. */
const BUNDLED_SRC_RE = /^[.~@]/;

/** Значение `src` у картинки в готовой разметке. */
const IMAGE_SRC_RE = /src="([^"]+)"/g;

/**
 * Собирает из готовой разметки код модуля, подставляя картинки импортами.
 *
 * Относительные и алиасные пути проходят через сборщик: он проверит, что файл
 * на месте, добавит хэш к имени и заинлайнит мелкие картинки в base64. Ссылки
 * на `public/` и внешние адреса остаются строками — сборщик их не трогает.
 *
 * @param html Разметка, отрендеренная из `.md`.
 * @returns Исходник JS-модуля с дефолтным экспортом-строкой.
 */
function buildModuleCode(html: string): string {
    const imports: string[] = [];
    const chunks: string[] = [];

    let cursor = 0;

    for (const match of html.matchAll(IMAGE_SRC_RE)) {
        const src = match[1]!;

        if (!BUNDLED_SRC_RE.test(src)) {
            continue;
        }

        const name = `__md_image_${imports.length}`;

        // markdown-it прогоняет адрес через encodeURI, а импорту нужен путь
        // в том виде, в каком он записан на диске — иначе не найдётся файл
        // с пробелом или кириллицей в имени
        imports.push(`import ${name} from ${JSON.stringify(decodeURI(src))};`);

        const srcStart = match.index + match[0].length - src.length - 1;

        chunks.push(JSON.stringify(html.slice(cursor, srcStart)), name);
        cursor = srcStart + src.length;
    }

    chunks.push(JSON.stringify(html.slice(cursor)));

    return `${imports.join('\n')}\nexport default ${chunks.join(' + ')};`;
}

/**
 * Vite-плагин: превращает импорт `.md`-файла в строку готового HTML.
 *
 * Разметка собирается на этапе сборки, поэтому ни markdown-it, ни
 * sanitize-html не попадают в клиентский бандл — в рантайме остаётся только
 * строка, которую компонент выводит через `v-html`.
 *
 * @returns Конфигурация плагина для `vite.plugins` в `nuxt.config.ts`.
 */
export function viteMarkdown(): Plugin {
    return {
        name: 'eoc:markdown',
        enforce: 'pre',

        transform(code, id) {
            if (!id.endsWith('.md')) {
                return null;
            }

            const html = sanitizeHtml(markdown.render(code), MARKDOWN_SANITIZE_OPTIONS).trim();

            return {
                code: buildModuleCode(html),
                map: null,
            };
        },
    };
}
