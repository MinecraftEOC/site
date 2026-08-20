import type { TContentForm } from '~/@types/content';

import { CONTENT_FORM_FIELDS, CONTENT_IMAGE_PATH } from '~~/shared/constants/content';

/**
 * Собирает тело `multipart/form-data` для ручек создания и правки материала.
 * Файлы уходят только выбранные: при правке пустой инпут означает «оставить
 * прежний файл», а не «удалить».
 *
 * @param form Данные формы материала.
 * @returns `FormData` с полями материала и выбранными файлами.
 */
export function toContentFormData(form: TContentForm): FormData {
    const data = new FormData();

    data.append(CONTENT_FORM_FIELDS.type, form.type);
    data.append(CONTENT_FORM_FIELDS.slug, form.slug);
    data.append(CONTENT_FORM_FIELDS.title, form.title);
    data.append(CONTENT_FORM_FIELDS.description, form.description ?? '');

    const [image] = form.image;
    if (image) {
        data.append(CONTENT_FORM_FIELDS.image, image);
    }

    const [markdown] = form.markdown;
    if (markdown) {
        data.append(CONTENT_FORM_FIELDS.markdown, markdown);
    }

    for (const file of form.gallery) {
        data.append(CONTENT_FORM_FIELDS.gallery, file);
    }

    if (form.removedImages.length) {
        data.append(CONTENT_FORM_FIELDS.removedImages, JSON.stringify(form.removedImages));
    }

    return data;
}

/**
 * Адрес картинки материала.
 *
 * @param file Имя файла в хранилище.
 * @returns Путь к картинке на сервере.
 */
export function getContentImageUrl(file: string): string {
    return `${CONTENT_IMAGE_PATH}/${file}`;
}

/**
 * Имя, под которым картинка ищется в тексте материала: сервер сопоставляет
 * ссылки из `.md` с загруженными файлами по имени без пути и регистра.
 *
 * @param filename Имя файла.
 * @returns Имя файла в нижнем регистре.
 */
export function getContentImageName(filename: string): string {
    return filename.trim().toLowerCase();
}

/**
 * Готовая markdown-разметка для вставки картинки в текст материала.
 *
 * @param name Имя файла картинки.
 * @returns Строка вида `![](battle.png)`.
 */
export function getContentImageMarkdown(name: string): string {
    return `![](${name})`;
}
