import type { Prisma } from '~~/generated/prisma/client';
import type { IImageFormat } from '~~/server/common/@types/content';

/**
 * Тексты ошибок ручек контента, возвращаемые через `createError`. Проверки
 * текстовых полей формы живут в схеме — там же и их тексты
 * (`CONTENT_FORM_ERRORS`).
 */
export const CONTENT_ERRORS = {
    EMPTY_ID: 'ID материала не задан',
    NOT_FOUND: 'Материал не найден',
    SLUG_TAKEN: 'Материал с таким слагом уже есть в этом разделе',
    NOTHING_TO_UPDATE: 'Не передано ни одного поля для обновления',
    IMAGE_EMPTY: 'Файл картинки пустой',
    IMAGE_TOO_LARGE: 'Картинка слишком большая',
    IMAGE_INVALID: 'Картинка должна быть в формате PNG, JPEG или WebP',
    IMAGE_NOT_FOUND: 'Картинка не найдена',
    MARKDOWN_EMPTY: 'Файл с текстом пустой',
    MARKDOWN_TOO_LARGE: 'Файл с текстом слишком большой',
    MARKDOWN_INVALID: 'Текст материала должен быть .md-файлом',
    MARKDOWN_NO_CONTENT: 'В .md-файле не оказалось текста',
};

/** Папка хранения файлов материалов относительно корня репозитория. */
export const CONTENT_STORAGE_DIR = 'storage/content';

/** Длина случайного хэша картинки в байтах (итоговое hex-имя — вдвое длиннее). */
export const CONTENT_IMAGE_HASH_BYTES = 16;

/** Регулярка имени файла картинки (hex-хэш и расширение) — защита от path traversal. */
export const CONTENT_IMAGE_FILE_REGEX = /^[a-f0-9]{32}\.(?:png|jpg|webp)$/;

/**
 * Поддерживаемые форматы картинок: формат опознаётся по сигнатуре файла, а не
 * по имени или заявленному `Content-Type`. У WebP значащих кусков два — общий
 * контейнер `RIFF` и метка формата со смещения 8.
 */
export const CONTENT_IMAGE_FORMATS: IImageFormat[] = [
    {
        extension: 'png',
        contentType: 'image/png',
        signatures: [{ offset: 0, bytes: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A] }],
    },
    {
        extension: 'jpg',
        contentType: 'image/jpeg',
        signatures: [{ offset: 0, bytes: [0xFF, 0xD8, 0xFF] }],
    },
    {
        extension: 'webp',
        contentType: 'image/webp',
        signatures: [
            { offset: 0, bytes: [0x52, 0x49, 0x46, 0x46] },
            { offset: 8, bytes: [0x57, 0x45, 0x42, 0x50] },
        ],
    },
];

/**
 * `select` карточки материала — всё, кроме текста: списки грузятся целиком, а
 * статьи в них не нужны. `satisfies` сохраняет литеральный тип для вывода
 * Prisma.
 */
export const CONTENT_ITEM_SELECT = {
    id: true,
    type: true,
    slug: true,
    title: true,
    description: true,
    image: true,
    createdAt: true,
    updatedAt: true,
} satisfies Prisma.ContentEntrySelect;

/** `select` материала для детальной страницы — карточка плюс готовая разметка. */
export const CONTENT_ENTRY_SELECT = {
    ...CONTENT_ITEM_SELECT,
    html: true,
} satisfies Prisma.ContentEntrySelect;

/** `select` материала для админки — плюс исходный markdown. */
export const CONTENT_ADMIN_SELECT = {
    ...CONTENT_ENTRY_SELECT,
    source: true,
} satisfies Prisma.ContentEntrySelect;
