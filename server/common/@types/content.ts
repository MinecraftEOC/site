import type { Buffer } from 'node:buffer';
import type { Prisma } from '~~/generated/prisma/client';
import type { CONTENT_ADMIN_SELECT, CONTENT_ENTRY_SELECT, CONTENT_ITEM_SELECT } from '~~/server/common/constants/content';

/** Кусок сигнатуры файла: ожидаемые байты и их смещение от начала. */
export interface IFileSignature {
    /** Смещение первого байта от начала файла. */
    offset: number;
    /** Ожидаемые значения байтов подряд. */
    bytes: number[];
}

/** Поддерживаемый формат картинки материала. */
export interface IImageFormat {
    /** Расширение, под которым файл ложится в хранилище. */
    extension: string;
    /** Заголовок `Content-Type` при отдаче файла. */
    contentType: string;
    /** Куски сигнатуры: формат опознан, если совпали все. */
    signatures: IFileSignature[];
}

/** Картинка материала, прошедшая проверки: содержимое и опознанный формат. */
export interface IContentImage {
    /** Содержимое файла. */
    data: Buffer;
    /** Формат, опознанный по сигнатуре. */
    format: IImageFormat;
}

/** Материал в форме `CONTENT_ITEM_SELECT`. */
export type TContentItemRow = Prisma.ContentEntryGetPayload<{ select: typeof CONTENT_ITEM_SELECT }>;

/** Материал в форме `CONTENT_ENTRY_SELECT`. */
export type TContentEntryRow = Prisma.ContentEntryGetPayload<{ select: typeof CONTENT_ENTRY_SELECT }>;

/** Материал в форме `CONTENT_ADMIN_SELECT`. */
export type TContentAdminRow = Prisma.ContentEntryGetPayload<{ select: typeof CONTENT_ADMIN_SELECT }>;
