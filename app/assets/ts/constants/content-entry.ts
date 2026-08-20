import type { IContentColumn, IContentSectionRoutes } from '~/@types/content';
import type { ISwitcherItem } from '~/@types/switcher';

import { ContentType } from '~~/generated/prisma/enums';
import { CONTENT_TYPES } from '~~/shared/constants/content';
import { CONTENT_TYPE_ICON, CONTENT_TYPE_LABEL } from '~/assets/ts/constants/content/account';
import { ACCOUNT_ROUTES, MAIN_ROUTES } from '~/assets/ts/constants/routes';
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

/** Адреса разделов в публичной части сайта. */
export const CONTENT_ROUTES: Record<ContentType, IContentSectionRoutes> = {
    [ContentType.NEWS]: { list: MAIN_ROUTES.news, entry: MAIN_ROUTES.newsEntry },
    [ContentType.LORE]: { list: MAIN_ROUTES.lore, entry: MAIN_ROUTES.loreEntry },
};

/** Адреса тех же разделов внутри личного кабинета. */
export const CONTENT_ACCOUNT_ROUTES: Record<ContentType, IContentSectionRoutes> = {
    [ContentType.NEWS]: { list: ACCOUNT_ROUTES.news, entry: ACCOUNT_ROUTES.newsEntry },
    [ContentType.LORE]: { list: ACCOUNT_ROUTES.lore, entry: ACCOUNT_ROUTES.loreEntry },
};
