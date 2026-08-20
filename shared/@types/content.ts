import type { ContentType } from '~~/generated/prisma/enums';

/** Материал в списке: всё для карточки, кроме текста. */
export interface IContentItem {
    /** Id материала. */
    id: number;
    /** Раздел материала (`NEWS`/`LORE`). */
    type: ContentType;
    /** Слаг материала — им же материал открывается на детальной странице. */
    slug: string;
    /** Заголовок материала. */
    title: string;
    /** Краткое описание на карточке. */
    description: string | null;
    /** Имя файла картинки в хранилище. */
    image: string;
    /** Момент создания материала в ISO-формате. */
    createdAt: string;
    /** Момент последней правки материала в ISO-формате. */
    updatedAt: string;
}

/** Материал вместе с готовой разметкой текста для детальной страницы. */
export interface IContentEntry extends IContentItem {
    /** Текст материала: HTML, собранный из `.md`-файла. */
    html: string;
}

/** Материал в админке: с разметкой и исходным markdown. */
export interface IContentAdminEntry extends IContentEntry {
    /** Исходный текст загруженного `.md`-файла. */
    source: string;
}
