import type { TContentBody } from '~~/shared/schemas/content';
import type { EContentColumn } from '~/assets/ts/enums/content';

/** Данные формы материала: поля ручки плюс клиентские файлы */
export type TContentForm = TContentBody & {
    /** Файл картинки из инпута: пустой массив — картинка не менялась */
    image: File[];
    /** Файл с текстом материала из инпута: пустой массив — текст не менялся */
    markdown: File[];
    /** Новые картинки для текста материала */
    gallery: File[];
    /** Id сохранённых картинок текста, помеченных к удалению */
    removedImages: number[];
};

/** Колонка таблицы материалов в админке */
export interface IContentColumn {
    /** Ключ колонки — им же берётся подпись заголовка */
    value: EContentColumn;
    /** Ширина колонки для `colgroup` */
    width: string;
}

/** Заглушка пустого раздела: иконка и тексты */
export interface IContentEmptyState {
    /** Имя иконки в кружке над заголовком */
    icon: string;
    /** Заголовок заглушки */
    title: string;
    /** Пояснение под заголовком */
    description: string;
}

/** Тексты страниц раздела контента — общие для кабинета и публичной части */
export interface IContentPage {
    /** Заголовок страницы списка */
    title: string;
    /** Пояснение под заголовком */
    description: string;
    /** Подпись кнопки возврата к списку с детальной страницы */
    backButton: string;
    /** Описание страницы для мета-тега */
    metaDescription: string;
    /** Заглушка, когда в разделе нет материалов */
    empty: IContentEmptyState;
}

/** Адреса раздела контента: список и детальная страница материала */
export interface IContentSectionRoutes {
    /** Адрес страницы со списком материалов */
    list: string;
    /** Адрес детальной страницы материала по слагу */
    entry: (slug: string) => string;
}
