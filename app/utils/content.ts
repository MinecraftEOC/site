import type { TContentForm } from '~/@types/content';

import { CONTENT_FORM_FIELDS } from '~~/shared/constants/content';

/** Адрес ручки, отдающей картинки материалов. */
const CONTENT_IMAGE_PATH = '/api/content/image';

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
