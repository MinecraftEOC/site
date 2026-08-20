import type { MultiPartData } from 'h3';
import type { Buffer } from 'node:buffer';
import type { ZodSchema } from 'zod';
import type { IContentGalleryUpload, IContentImageUpload, IImageFormat } from '~~/server/common/@types/content';

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
    CONTENT_IMAGE_PATH,
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
export function collectContentImage(parts: MultiPartData[] | undefined): IContentImageUpload | null {
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
export async function saveContentImage(image: IContentImageUpload) {
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
 * Приводит имя файла к виду, под которым картинка ищется в тексте: только имя
 * файла в нижнем регистре. Путь отбрасывается — в тексте картинка может быть
 * указана и как `battle.png`, и как `./images/battle.png`.
 *
 * @param filename Имя файла из формы или адрес из разметки.
 * @returns Имя файла без пути, в нижнем регистре.
 */
export function toContentImageName(filename: string): string {
    return decodeURI(filename).split(/[/\\]/).pop()?.trim().toLowerCase() ?? '';
}

/**
 * Достаёт и валидирует картинки для текста материала из поля `gallery`.
 * На диск ничего не пишет.
 *
 * @param parts Разобранные части multipart-запроса.
 * @returns Проверенные картинки с именами (список может быть пустым).
 * @throws `400` если файл пустой, слишком большой, не картинка или без имени.
 */
export function collectContentGallery(parts: MultiPartData[] | undefined): IContentGalleryUpload[] {
    const files = (parts ?? []).filter(part => part.name === CONTENT_FORM_FIELDS.gallery && Boolean(part.filename));

    const images = files.map((file) => {
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

        const name = toContentImageName(file.filename ?? '');
        if (!name) {
            throw createError({ statusCode: 400, message: CONTENT_ERRORS.GALLERY_NAME_INVALID });
        }

        return { data: file.data, format, name };
    });

    // Имя — единственная связь картинки с текстом: два файла с одинаковым
    // именем сделали бы ссылку в тексте неоднозначной
    if (new Set(images.map(image => image.name)).size !== images.length) {
        throw createError({ statusCode: 400, message: CONTENT_ERRORS.GALLERY_NAME_TAKEN });
    }

    return images;
}

/**
 * Сохраняет картинки текста на диск по принципу «всё или ничего»: при ошибке
 * записи уже сохранённые файлы удаляются.
 *
 * @param images Проверенные картинки с именами.
 * @returns Имена в тексте вместе с именами сохранённых файлов.
 */
export async function saveContentGallery(images: IContentGalleryUpload[]) {
    const saved: { name: string; file: string }[] = [];

    try {
        for (const image of images) {
            saved.push({ name: image.name, file: await saveContentImage(image) });
        }

        return saved;
    } catch (error) {
        await deleteContentImages(saved.map(item => item.file));
        throw error;
    }
}

/**
 * Удаляет файлы картинок. Отсутствие файлов не считается ошибкой.
 *
 * @param files Имена файлов в хранилище.
 */
export async function deleteContentImages(files: string[]) {
    await Promise.all(files.map(file => deleteContentImage(file)));
}

/** Значение `src` у картинки в готовой разметке. */
const IMAGE_SRC_RE = /src="([^"]+)"/g;

/** Адреса, которые ведут наружу или уже указывают на конкретный файл сайта. */
const ABSOLUTE_SRC_RE = /^(?:[a-z][\w+.-]*:|\/)/i;

/**
 * Подставляет в разметку адреса загруженных картинок: относительная ссылка из
 * `.md` (`battle.png`) сопоставляется с картинкой материала по имени файла.
 * Абсолютные адреса остаются как есть — на них ссылаются намеренно.
 *
 * @param html Разметка, отрендеренная из `.md`.
 * @param images Картинки материала: имя в тексте и имя файла в хранилище.
 * @returns Разметка с рабочими адресами картинок.
 */
export function applyContentImages(html: string, images: { name: string; file: string }[]): string {
    if (!images.length) {
        return html;
    }

    const files = new Map(images.map(image => [image.name, image.file]));

    return html.replace(IMAGE_SRC_RE, (match, src: string) => {
        if (ABSOLUTE_SRC_RE.test(src)) {
            return match;
        }

        const file = files.get(toContentImageName(src));

        return file ? `src="${CONTENT_IMAGE_PATH}/${file}"` : match;
    });
}

/**
 * Готовит текст материала к записи: разметка собирается один раз здесь, а не
 * на каждом открытии страницы, исходник остаётся для повторного рендера.
 *
 * @param source Текст `.md`-файла.
 * @param images Картинки материала, на которые может ссылаться текст.
 * @returns Очищенная HTML-разметка с адресами загруженных картинок.
 * @throws `400` если после рендера и очистки не осталось разметки.
 */
export function renderContentMarkdown(source: string, images: { name: string; file: string }[]): string {
    const html = renderMarkdown(source);

    if (!html) {
        throw createError({ statusCode: 400, message: CONTENT_ERRORS.MARKDOWN_NO_CONTENT });
    }

    return applyContentImages(html, images);
}

/**
 * Читает список id картинок, которые нужно удалить вместе с правкой.
 *
 * @param parts Части multipart-запроса.
 * @returns Id картинок; пустой список, если поле не прислали.
 * @throws `400` если поле содержит не массив целых чисел.
 */
export function parseRemovedImages(parts: MultiPartData[] | undefined): number[] {
    const raw = getFormJson(parts, CONTENT_FORM_FIELDS.removedImages, CONTENT_ERRORS.REMOVED_IMAGES_INVALID);

    if (raw === undefined) {
        return [];
    }

    if (!Array.isArray(raw) || raw.some(id => !Number.isInteger(id))) {
        throw createError({ statusCode: 400, message: CONTENT_ERRORS.REMOVED_IMAGES_INVALID });
    }

    return raw as number[];
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
