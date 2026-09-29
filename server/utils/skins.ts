import type { MultiPartData } from 'h3';
import type { Buffer } from 'node:buffer';

import { randomBytes } from 'node:crypto';
import { copyFile, mkdir, readFile, rename, symlink, unlink, writeFile } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';
import process from 'node:process';

import {
    ACTIVE_SKIN_DIR,
    PNG_IHDR_SIZE_OFFSET,
    PNG_IHDR_TYPE,
    PNG_SIGNATURE,
    SKIN_ERRORS,
    SKIN_HASH_BYTES,
    SKIN_STORAGE_DIR,
} from '~~/server/common/constants/skin';
import { SKIN_ACTIVE_FORM_FIELD, SKIN_FORM_FIELD, SKIN_MAX_SIZE, SKIN_MAX_WIDTH, SKIN_WIDTH_STEP } from '~~/shared/constants/skin';

/** Абсолютный путь к папке хранения скинов. */
const storageDir = resolve(process.cwd(), SKIN_STORAGE_DIR);

/** Абсолютный путь к папке активных скинов. */
const activeDir = resolve(process.cwd(), ACTIVE_SKIN_DIR);

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
 * Проверяет, что буфер является PNG-файлом — по сигнатуре, а не по имени.
 *
 * @param data Содержимое файла.
 * @returns `true`, если первые байты совпадают с сигнатурой PNG.
 */
export function isPng(data: Buffer) {
    return data.length >= PNG_SIGNATURE.length && PNG_SIGNATURE.every((byte, index) => data[index] === byte);
}

/**
 * Читает ширину и высоту PNG из заголовка IHDR, не декодируя картинку.
 *
 * @param data Содержимое PNG-файла (сигнатура уже проверена).
 * @returns Размеры в пикселях или `null`, если заголовок повреждён.
 */
export function readPngSize(data: Buffer) {
    const typeOffset = PNG_IHDR_SIZE_OFFSET - PNG_IHDR_TYPE.length;

    if (data.length < PNG_IHDR_SIZE_OFFSET + 8 || data.toString('ascii', typeOffset, PNG_IHDR_SIZE_OFFSET) !== PNG_IHDR_TYPE) {
        return null;
    }

    return {
        width: data.readUInt32BE(PNG_IHDR_SIZE_OFFSET),
        height: data.readUInt32BE(PNG_IHDR_SIZE_OFFSET + 4),
    };
}

/**
 * Проверяет размеры скина по правилам лаунчера — неподходящий он молча
 * игнорирует, и в игре остаётся дефолтный скин.
 *
 * @param data Содержимое PNG-файла.
 * @returns `true`, если ширина кратна 64 и не больше 1024, а высота равна ширине или вдвое меньше.
 */
export function hasValidSkinSize(data: Buffer) {
    const size = readPngSize(data);

    if (!size) {
        return false;
    }

    const { width, height } = size;

    return width > 0
        && width % SKIN_WIDTH_STEP === 0
        && width <= SKIN_MAX_WIDTH
        && (height === width || height * 2 === width);
}

/**
 * Сохраняет PNG-буфер скина на диск под случайным хэшем.
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
 * Достаёт и валидирует файлы скинов из поля `skin`. На диск ничего не пишет.
 *
 * @param parts Разобранные части multipart-запроса.
 * @returns Буферы валидных PNG-файлов (список может быть пустым).
 * @throws `400` если файл пустой, превышает лимит размера, не является PNG или не подходит по размерам.
 */
export function collectSkinFiles(parts: MultiPartData[] | undefined) {
    const files = (parts ?? []).filter(part => part.name === SKIN_FORM_FIELD && Boolean(part.filename));

    for (const file of files) {
        if (file.data.length === 0) {
            throw createError({ statusCode: 400, message: SKIN_ERRORS.EMPTY_FILE });
        }

        if (file.data.length > SKIN_MAX_SIZE) {
            throw createError({ statusCode: 400, message: SKIN_ERRORS.TOO_LARGE });
        }

        if (!isPng(file.data)) {
            throw createError({ statusCode: 400, message: SKIN_ERRORS.NOT_PNG });
        }

        if (!hasValidSkinSize(file.data)) {
            throw createError({ statusCode: 400, message: SKIN_ERRORS.BAD_DIMENSIONS });
        }
    }

    return files.map(file => file.data);
}

/**
 * Сохраняет буферы скинов на диск по принципу «всё или ничего»: при ошибке
 * записи уже сохранённые файлы удаляются.
 *
 * @param buffers Буферы PNG-файлов.
 * @returns Сгенерированные хэши в порядке буферов.
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
 * Удаляет файлы скинов по хэшам. Отсутствие файлов не ошибка.
 *
 * @param hashes Хэши скинов.
 */
export async function deleteSkinFiles(hashes: string[]) {
    await Promise.all(hashes.map(hash => deleteSkinFile(hash)));
}

/**
 * Индекс загружаемого файла, который пользователь выбрал активным скином.
 *
 * @param parts Разобранные части multipart-запроса.
 * @param count Сколько файлов скинов пришло в запросе.
 * @returns Индекс файла или `undefined`, если поле не передано.
 * @throws `400` если индекс не целый или выходит за пределы загруженных файлов.
 */
export function getActiveSkinIndex(parts: MultiPartData[] | undefined, count: number) {
    const raw = getFormField(parts, SKIN_ACTIVE_FORM_FIELD);

    if (raw === undefined) {
        return undefined;
    }

    const index = Number(raw);

    if (!Number.isInteger(index) || index < 0 || index >= count) {
        throw createError({ statusCode: 400, message: SKIN_ERRORS.ACTIVE_INVALID });
    }

    return index;
}

/**
 * Выбирает среди только что сохранённых скинов тот, что станет активным.
 *
 * @param hashes Хэши сохранённых скинов в порядке файлов запроса.
 * @param activeIndex Индекс, выбранный пользователем.
 * @param hasActive Есть ли у персонажа активный скин.
 * @returns Хэш нового активного скина или `undefined`, если активный не меняется.
 */
export function pickActiveSkinHash(hashes: string[], activeIndex: number | undefined, hasActive: boolean) {
    if (activeIndex !== undefined) {
        return hashes[activeIndex];
    }

    return hasActive ? undefined : hashes[0];
}

/**
 * Путь к файлу активного скина персонажа — его читает лаунчер.
 *
 * @param uuid UUID персонажа.
 * @returns Абсолютный путь к `<uuid>.png`.
 */
export function activeSkinPath(uuid: string) {
    return join(activeDir, `${uuid}.png`);
}

/**
 * Делает скин активным для лаунчера: атомарно подменяет симлинк
 * `<uuid>.png` на файл скина.
 *
 * @param uuid UUID персонажа.
 * @param hash Хэш скина, который становится активным.
 */
export async function linkActiveSkin(uuid: string, hash: string) {
    await mkdir(activeDir, { recursive: true });

    const target = activeSkinPath(uuid);
    const temp = join(activeDir, `.${uuid}.${randomBytes(4).toString('hex')}.tmp`);

    try {
        await symlink(relative(activeDir, skinFilePath(hash)), temp).catch(async (error: NodeJS.ErrnoException) => {
            // Windows без режима разработчика не даёт создавать симлинки — это
            // только локальная разработка, на проде (Linux) остаётся симлинк.
            if (error.code !== 'EPERM') {
                throw error;
            }

            await copyFile(skinFilePath(hash), temp);
        });

        // rename поверх старого файла атомарен: лаунчер не застанет момент,
        // когда активного скина нет вовсе.
        await rename(temp, target);
    } catch (error) {
        await unlink(temp).catch(() => {});
        throw error;
    }
}

/**
 * Снимает активный скин персонажа. Отсутствие файла не считается ошибкой.
 *
 * @param uuid UUID персонажа.
 */
export async function unlinkActiveSkin(uuid: string) {
    await unlink(activeSkinPath(uuid)).catch(() => {});
}
