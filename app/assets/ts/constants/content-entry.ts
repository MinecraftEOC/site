import type { ContentType } from '~~/generated/prisma/enums';
import type { IContentColumn } from '~/@types/content';
import type { ISwitcherItem } from '~/@types/switcher';

import { CONTENT_TYPES } from '~~/shared/constants/content';
import { CONTENT_TYPE_ICON, CONTENT_TYPE_LABEL } from '~/assets/ts/constants/content/account';
import { EContentColumn } from '~/assets/ts/enums/content';

/**
 * Колонки таблицы материалов слева направо. Ширины заданы явно и в сумме дают
 * 100%: раскладка таблицы фиксированная, иначе колонки прыгали бы вслед за
 * длиной заголовков.
 */
export const CONTENT_COLUMNS: IContentColumn[] = [
    { value: EContentColumn.Image, width: '12%' },
    { value: EContentColumn.Title, width: '38%' },
    { value: EContentColumn.Slug, width: '20%' },
    { value: EContentColumn.CreatedAt, width: '11%' },
    { value: EContentColumn.UpdatedAt, width: '11%' },
    { value: EContentColumn.Actions, width: '8%' },
];

/** Варианты переключателя разделов: новости и история мира. */
export const CONTENT_TYPE_TABS: ISwitcherItem<ContentType>[] = CONTENT_TYPES.map(type => ({
    value: type,
    label: CONTENT_TYPE_LABEL[type],
    icon: CONTENT_TYPE_ICON[type],
}));
