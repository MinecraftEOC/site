import type { FetchError } from 'ofetch';

import { ROOT_FONT_SIZE } from '~/assets/ts/constants/common';

/**
 * Переводит размер из px макета в rem — TS-аналог SCSS-функции `rem()`.
 *
 * @param px Размер в px (например, `20`).
 * @returns Значение с единицами rem (например, `'2rem'`).
 */
export function rem(px: number): string {
    return `${px / ROOT_FONT_SIZE}rem`;
}

/**
 * Форматирует дату в `ДД.ММ.ГГГГ` по UTC.
 *
 * Собирается вручную из `getUTC*`, а не через `toLocaleDateString`: результат не
 * зависит ни от локали, ни от таймзоны рантайма, поэтому SSR и клиент дают
 * одинаковую строку и гидрация не расходится.
 *
 * @param value Дата или её ISO-представление.
 * @returns Строка вида `12.04.1642`, либо пустая строка для невалидной даты.
 */
export function formatDate(value: string | Date): string {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return '';
    }

    const day = `${date.getUTCDate()}`.padStart(2, '0');
    const month = `${date.getUTCMonth() + 1}`.padStart(2, '0');

    return `${day}.${month}.${date.getUTCFullYear()}`;
}

/**
 * Достаёт человекочитаемый текст из ошибки `$fetch`.
 *
 * @param error Ошибка запроса.
 * @param fallback Текст, если в ответе ничего не нашлось.
 * @returns Сообщение с бэка (`message` → `statusMessage`) либо `fallback`.
 */
export function getApiErrorMessage(error: unknown, fallback = 'Что-то пошло не так'): string {
    const err = error as FetchError<{ statusMessage?: string; message?: string }>;
    return err?.data?.message ?? err?.data?.statusMessage ?? fallback;
}
