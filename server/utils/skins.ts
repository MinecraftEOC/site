import type { MultiPartData } from 'h3';
import type { Buffer } from 'node:buffer';

import { randomBytes } from 'node:crypto';
import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import process from 'node:process';

import { PNG_SIGNATURE, SKIN_ERRORS, SKIN_FORM_FIELD, SKIN_HASH_BYTES, SKIN_MAX_SIZE, SKIN_STORAGE_DIR } from '~~/server/common/constants/skin';

/** Абсолютный путь к папке хранения скинов. */
const storageDir = resolve(process.cwd(), SKIN_STORAGE_DIR);

/**
 * Путь к файлу скина по его хэшу.
 *
 * @param hash Хэш скина (имя файла без расширения).
 * @returns Абсолютный путь к `<hash>.png`.
 */
export function skinFilePath(hash: string) {
    return join(storageDir, `${hash}.png`);
}

/**
 * Проверяет, что буфер является PNG-файлом (по сигнатуре).
 *
 * @param data Содержимое файла.
 * @returns `true`, если первые байты совпадают с сигнатурой PNG.
 */
export function isPng(data: Buffer) {
    return data.length >= PNG_SIGNATURE.length && PNG_SIGNATURE.every((byte, index) => data[index] === byte);
}

/**
 * Сохраняет PNG-буфер скина на диск под случайным уникальным хэшем.
 *
 * @param data Содержимое PNG-файла.
 * @returns Сгенерированный хэш (имя файла без расширения).
 */
export async function saveSkinFile(data: Buffer) {
    await mkdir(storageDir, { recursive: true });
    const hash = randomBytes(SKIN_HASH_BYTES).toString('hex');
    await writeFile(skinFilePath(hash), data);

    return hash;
}

/**
 * Удаляет файл скина. Отсутствие файла не считается ошибкой.
 *
 * @param hash Хэш скина.
 */
export async function deleteSkinFile(hash: string) {
    await unlink(skinFilePath(hash)).catch(() => {});
}

/**
 * Читает файл скина по хэшу.
 *
 * @param hash Хэш скина.
 * @returns Буфер файла или `null`, если файла нет.
 */
export async function readSkinFile(hash: string) {
    return readFile(skinFilePath(hash)).catch(() => null);
}

/**
 * Извлекает и валидирует файлы скинов из multipart-частей (поле `skin`).
 * Проверяет каждый файл на PNG-сигнатуру и лимит размера. Ничего не пишет
 * на диск — только достаёт буферы.
 *
 * @param parts Разобранные части multipart-запроса.
 * @returns Список буферов валидных PNG-файлов (может быть пустым).
 * @throws `400` если какой-то файл превышает лимит размера или не является PNG.
 */
export function collectSkinFiles(parts: MultiPartData[] | undefined) {
    const files = (parts ?? []).filter(
        part => part.name === SKIN_FORM_FIELD && part.filename !== undefined && part.data.length > 0,
    );

    for (const file of files) {
        if (file.data.length > SKIN_MAX_SIZE) {
            throw createError({ statusCode: 400, statusMessage: SKIN_ERRORS.TOO_LARGE });
        }

        if (!isPng(file.data)) {
            throw createError({ statusCode: 400, statusMessage: SKIN_ERRORS.NOT_PNG });
        }
    }

    return files.map(file => file.data);
}

/**
 * Сохраняет несколько буферов скинов на диск. При ошибке записи любого файла
 * удаляет уже сохранённые — «всё или ничего».
 *
 * @param buffers Буферы PNG-файлов.
 * @returns Список сгенерированных хэшей в порядке буферов.
 */
export async function saveSkinFiles(buffers: Buffer[]) {
    const hashes: string[] = [];

    try {
        for (const buffer of buffers) {
            hashes.push(await saveSkinFile(buffer));
        }

        return hashes;
    } catch (error) {
        await deleteSkinFiles(hashes);
        throw error;
    }
}

/**
 * Удаляет несколько файлов скинов по хэшам. Отсутствие файлов не ошибка.
 *
 * @param hashes Хэши скинов.
 */
export async function deleteSkinFiles(hashes: string[]) {
    await Promise.all(hashes.map(hash => deleteSkinFile(hash)));
}
