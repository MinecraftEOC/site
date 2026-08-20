import type { MultiPartData } from 'h3';
import type { Buffer } from 'node:buffer';
import type { ZodSchema } from 'zod';
import type { IContentImage, IImageFormat } from '~~/server/common/@types/content';

import { randomBytes } from 'node:crypto';
import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import process from 'node:process';

import {
    CONTENT_ERRORS,
    CONTENT_IMAGE_FORMATS,
    CONTENT_IMAGE_HASH_BYTES,
    CONTENT_STORAGE_DIR,
} from '~~/server/common/constants/content';
import {
    CONTENT_FORM_FIELDS,
    CONTENT_IMAGE_MAX_SIZE,
    CONTENT_MARKDOWN_EXTENSION,
    CONTENT_MARKDOWN_MAX_SIZE,
} from '~~/shared/constants/content';
import { renderMarkdown } from '~~/shared/utils/markdown';

/** Абсолютный путь к папке хранения файлов материалов. */
const storageDir = resolve(process.cwd(), CONTENT_STORAGE_DIR);

/** Даты материала в том виде, в каком их отдаёт Prisma. */
interface IContentDates {
    /** Момент создания материала. */
    createdAt: Date;
    /** Момент последней правки материала. */
    updatedAt: Date;
}

/**
 * Приводит материал из Prisma к форме ответа API: даты — ISO-строки.
 *
 * @param entry Материал в форме любого из `CONTENT_*_SELECT`.
 * @returns Тот же материал с датами-строками.
 */
export function toContentResponse<T extends IContentDates>(entry: T) {
    return {
        ...entry,
        createdAt: entry.createdAt.toISOString(),
        updatedAt: entry.updatedAt.toISOString(),
    };
}

/**
 * Путь к файлу картинки материала.
 *
 * @param file Имя файла в хранилище.
 * @returns Абсолютный путь к файлу.
 */
export function contentImagePath(file: string) {
    return join(storageDir, file);
}

/**
 * Опознаёт формат картинки по сигнатуре файла, а не по имени и не по
 * заявленному типу.
 *
 * @param data Содержимое файла.
 * @returns Подходящий формат или `null`, если сигнатура ни с чем не совпала.
 */
export function detectImageFormat(data: Buffer): IImageFormat | null {
    const format = CONTENT_IMAGE_FORMATS.find(item => item.signatures.every(
        ({ offset, bytes }) => bytes.every((byte, index) => data[offset + index] === byte),
    ));

    return format ?? null;
}

/**
 * Достаёт и валидирует картинку материала из поля `image`. На диск ничего не пишет.
 *
 * @param parts Разобранные части multipart-запроса.
 * @returns Содержимое файла с опознанным форматом или `null`, если картинку не прислали.
 * @throws `400` если файл пустой, превышает лимит размера или не является картинкой.
 */
export function collectContentImage(parts: MultiPartData[] | undefined): IContentImage | null {
    const file = parts?.find(part => part.name === CONTENT_FORM_FIELDS.image && Boolean(part.filename));

    if (!file) {
        return null;
    }

    if (file.data.length === 0) {
        throw createError({ statusCode: 400, message: CONTENT_ERRORS.IMAGE_EMPTY });
    }

    if (file.data.length > CONTENT_IMAGE_MAX_SIZE) {
        throw createError({ statusCode: 400, message: CONTENT_ERRORS.IMAGE_TOO_LARGE });
    }

    const format = detectImageFormat(file.data);
    if (!format) {
        throw createError({ statusCode: 400, message: CONTENT_ERRORS.IMAGE_INVALID });
    }

    return { data: file.data, format };
}

/**
 * Сохраняет картинку материала на диск под случайным хэшем.
 *
 * @param image Проверенная картинка с опознанным форматом.
 * @returns Имя сохранённого файла вместе с расширением.
 */
export async function saveContentImage(image: IContentImage) {
    await mkdir(storageDir, { recursive: true });

    const file = `${randomBytes(CONTENT_IMAGE_HASH_BYTES).toString('hex')}.${image.format.extension}`;
    await writeFile(contentImagePath(file), image.data);

    return file;
}

/**
 * Удаляет картинку материала. Отсутствие файла не считается ошибкой.
 *
 * @param file Имя файла в хранилище.
 */
export async function deleteContentImage(file: string) {
    await unlink(contentImagePath(file)).catch(() => {});
}

/**
 * Читает картинку материала.
 *
 * @param file Имя файла в хранилище.
 * @returns Содержимое файла или `null`, если файла нет.
 */
export async function readContentImage(file: string) {
    return readFile(contentImagePath(file)).catch(() => null);
}

/**
 * Достаёт и валидирует `.md`-файл с текстом материала из поля `markdown`.
 *
 * @param parts Разобранные части multipart-запроса.
 * @returns Текст файла или `null`, если файл не прислали.
 * @throws `400` если файл пустой, превышает лимит размера или это не `.md`.
 */
export function collectContentMarkdown(parts: MultiPartData[] | undefined): string | null {
    const file = parts?.find(part => part.name === CONTENT_FORM_FIELDS.markdown && Boolean(part.filename));

    if (!file) {
        return null;
    }

    if (!file.filename?.toLowerCase().endsWith(CONTENT_MARKDOWN_EXTENSION)) {
        throw createError({ statusCode: 400, message: CONTENT_ERRORS.MARKDOWN_INVALID });
    }

    if (file.data.length === 0) {
        throw createError({ statusCode: 400, message: CONTENT_ERRORS.MARKDOWN_EMPTY });
    }

    if (file.data.length > CONTENT_MARKDOWN_MAX_SIZE) {
        throw createError({ statusCode: 400, message: CONTENT_ERRORS.MARKDOWN_TOO_LARGE });
    }

    return file.data.toString('utf-8');
}

/**
 * Готовит текст материала к записи: разметка собирается один раз здесь, а не
 * на каждом открытии страницы, исходник остаётся для повторного рендера.
 *
 * @param source Текст `.md`-файла.
 * @returns Исходник и очищенная HTML-разметка.
 * @throws `400` если после рендера и очистки не осталось разметки.
 */
export function prepareContentMarkdown(source: string) {
    const html = renderMarkdown(source);

    if (!html) {
        throw createError({ statusCode: 400, message: CONTENT_ERRORS.MARKDOWN_NO_CONTENT });
    }

    return { source, html };
}

/**
 * Собирает текстовые поля материала из multipart-запроса и валидирует их
 * общей схемой.
 *
 * @param parts Части multipart-запроса.
 * @param schema Схема полей: полная при создании, частичная при правке.
 * @returns Провалидированные поля материала.
 * @throws `400` с текстом первой ошибки схемы.
 */
export function parseContentFormOr400<T>(parts: MultiPartData[] | undefined, schema: ZodSchema<T>): T {
    return unwrapSafeParseOr400(schema.safeParse({
        type: getFormField(parts, CONTENT_FORM_FIELDS.type),
        slug: getFormField(parts, CONTENT_FORM_FIELDS.slug),
        title: getFormField(parts, CONTENT_FORM_FIELDS.title),
        description: getFormField(parts, CONTENT_FORM_FIELDS.description),
    }));
}
