import { ROOT_FONT_SIZE } from '~/assets/ts/constants/common';

/**
 * Переводит размер из px макета в rem — TS-аналог SCSS-функции `rem()`.
 * @param px — размер в px (например, 20)
 * @returns строка с единицами rem (например, `'2rem'`)
 */
export function rem(px: number): string {
    return `${px / ROOT_FONT_SIZE}rem`;
}
