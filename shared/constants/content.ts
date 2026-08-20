import { ContentType } from '~~/generated/prisma/enums';

/** Имена полей формы контента в multipart-запросе — общие для клиента и ручек. */
export const CONTENT_FORM_FIELDS = {
    type: 'type',
    slug: 'slug',
    title: 'title',
    description: 'description',
    image: 'image',
    markdown: 'markdown',
    gallery: 'gallery',
    removedImages: 'removedImages',
} as const;

/** Разделы контента в порядке вывода: и в табах админки, и в фильтрах. */
export const CONTENT_TYPES: ContentType[] = [ContentType.NEWS, ContentType.LORE];

/**
 * Регулярка слага: латиница в нижнем регистре и цифры, разделённые одиночными
 * дефисами. Слаг уходит в адрес страницы, поэтому кириллица и пробелы в нём
 * не допускаются.
 */
export const CONTENT_SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Максимальная длина слага. */
export const CONTENT_SLUG_MAX_LENGTH = 64;

/** Максимальная длина заголовка. */
export const CONTENT_TITLE_MAX_LENGTH = 120;

/** Максимальная длина краткого описания на карточке. */
export const CONTENT_DESCRIPTION_MAX_LENGTH = 300;

/** Максимальный размер картинки, байт (2 МБ). */
export const CONTENT_IMAGE_MAX_SIZE = 2 * 1024 * 1024;

/** Максимальный размер `.md`-файла с текстом, байт (256 КБ). */
export const CONTENT_MARKDOWN_MAX_SIZE = 256 * 1024;

/** Путь ручки, отдающей файлы картинок. */
export const CONTENT_IMAGE_PATH = '/api/content/image';

/** Максимум картинок в тексте одного материала. */
export const CONTENT_GALLERY_MAX_COUNT = 30;

/** Значение `accept` для инпута картинки. */
export const CONTENT_IMAGE_ACCEPT = 'image/png,image/jpeg,image/webp';

/** Значение `accept` для инпута с текстом материала. */
export const CONTENT_MARKDOWN_ACCEPT = '.md';

/** Расширение файла с текстом материала. */
export const CONTENT_MARKDOWN_EXTENSION = '.md';
