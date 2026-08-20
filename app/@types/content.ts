import type { TContentBody } from '~~/shared/schemas/content';
import type { EContentColumn } from '~/assets/ts/enums/content';

/** Данные формы материала: поля ручки плюс клиентские файлы */
export type TContentForm = TContentBody & {
    /** Файл картинки из инпута: пустой массив — картинка не менялась */
    image: File[];
    /** Файл с текстом материала из инпута: пустой массив — текст не менялся */
    markdown: File[];
};

/** Колонка таблицы материалов в админке */
export interface IContentColumn {
    /** Ключ колонки — им же берётся подпись заголовка */
    value: EContentColumn;
    /** Ширина колонки для `colgroup` */
    width: string;
}
