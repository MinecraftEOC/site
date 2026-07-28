import type { FetchError } from 'ofetch';

import { ROOT_FONT_SIZE } from '~/assets/ts/constants/common';

/**
 * Переводит размер из px макета в rem — TS-аналог SCSS-функции `rem()`.
 * @param px — размер в px (например, 20)
 * @returns строка с единицами rem (например, `'2rem'`)
 */
export function rem(px: number): string {
    return `${px / ROOT_FONT_SIZE}rem`;
}

/** Достаёт человекочитаемый текст из ошибки $fetch (message с бэка → statusMessage → запасной). */
export function getApiErrorMessage(error: unknown, fallback = 'Что-то пошло не так'): string {
    const err = error as FetchError<{ statusMessage?: string; message?: string }>;
    return err?.data?.message ?? err?.data?.statusMessage ?? fallback;
}
