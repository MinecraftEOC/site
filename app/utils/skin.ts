import type { ISkinFileItem, TSkinItem } from '~/@types/skin';

import { SKIN_LABEL_PREFIX } from '~/assets/ts/constants/skin';

/**
 * Проверяет, что элемент слайдера — ещё не отправленный файл.
 *
 * @param item Элемент слайдера скинов.
 * @returns `true`, если скин пришёл из инпута, а не с сервера.
 */
export function isSkinFileItem(item: TSkinItem): item is ISkinFileItem {
    return 'file' in item;
}

/**
 * Файл скина для превью.
 *
 * @param item Элемент слайдера скинов.
 * @returns Файл из инпута или `null` для уже сохранённого скина.
 */
export function getSkinFile(item: TSkinItem): File | null {
    return isSkinFileItem(item) ? item.file : null;
}

/**
 * Хэш скина для превью.
 *
 * @param item Элемент слайдера скинов.
 * @returns Хэш сохранённого скина или пустая строка для файла из инпута.
 */
export function getSkinHash(item: TSkinItem): string {
    return isSkinFileItem(item) ? '' : item.hash;
}

/**
 * Ключ элемента для `v-for`.
 *
 * @param item Элемент слайдера скинов.
 * @returns Id сохранённого скина или подпись файла из имени, размера и даты изменения — у двух одинаковых файлов она совпадёт.
 */
export function getSkinKey(item: TSkinItem): string {
    if (isSkinFileItem(item)) {
        return `${item.file.name}-${item.file.size}-${item.file.lastModified}`;
    }

    return `skin-${item.id}`;
}

/**
 * Подпись под превью скина.
 *
 * @param item Элемент слайдера скинов.
 * @param index Позиция элемента в списке.
 * @returns Имя файла, переданная подпись или порядковый номер.
 */
export function getSkinLabel(item: TSkinItem, index: number): string {
    if (isSkinFileItem(item)) {
        return item.file.name;
    }

    return item.label || `${SKIN_LABEL_PREFIX} ${index + 1}`;
}
