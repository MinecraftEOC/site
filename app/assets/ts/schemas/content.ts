import { toTypedSchema } from '@vee-validate/zod';
import { z } from 'zod';

import { CONTENT_FORM_FIELDS } from '~~/shared/constants/content';
import { CONTENT_FORM_ERRORS, sharedContentSchema } from '~~/shared/schemas/content';

/**
 * Собирает схему формы материала: общие правила ручки плюс клиентские поля
 * файлов. При правке файлы необязательны — пустой инпут оставляет сохранённые
 * картинку и текст как есть.
 *
 * @param isEdit Форма открыта на редактирование сохранённого материала.
 * @returns Схема формы под текущий режим.
 */
export function getContentFormSchema(isEdit: boolean) {
    const imageField = z.array(z.custom<File>());
    const markdownField = z.array(z.custom<File>());

    return toTypedSchema(
        sharedContentSchema.extend({
            [CONTENT_FORM_FIELDS.image]: isEdit ? imageField : imageField.min(1, CONTENT_FORM_ERRORS.IMAGE_REQUIRED),
            [CONTENT_FORM_FIELDS.markdown]: isEdit ? markdownField : markdownField.min(1, CONTENT_FORM_ERRORS.MARKDOWN_REQUIRED),
        }),
    );
}
