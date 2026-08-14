import type { TCharacterForm } from '~/@types/character';

import { CHARACTER_FORM_FIELDS } from '~~/shared/constants/character';
import { SKIN_FORM_FIELD } from '~~/shared/constants/skin';
import { CHARACTER_FORM_ORDER } from '~/assets/ts/constants/character';

/**
 * Собирает тело `multipart/form-data` для ручек создания и правки персонажа.
 *
 * @param form Данные формы персонажа.
 * @returns `FormData` с полями персонажа и файлами скинов.
 */
export function toCharacterFormData(form: TCharacterForm): FormData {
    const data = new FormData();

    data.append(CHARACTER_FORM_FIELDS.username, form.username);
    data.append(CHARACTER_FORM_FIELDS.biography, form.biography);
    data.append(CHARACTER_FORM_FIELDS.states, JSON.stringify(form.states));
    data.append(CHARACTER_FORM_FIELDS.startingItems, JSON.stringify(form.startingItems));

    for (const skin of form.skins) {
        data.append(SKIN_FORM_FIELD, skin);
    }

    return data;
}

/**
 * Собирает тело `multipart/form-data` для ручки добавления скинов.
 *
 * @param files Файлы скинов из инпута.
 * @returns `FormData` только с файлами скинов.
 */
export function toSkinsFormData(files: File[]): FormData {
    const data = new FormData();

    for (const skin of files) {
        data.append(SKIN_FORM_FIELD, skin);
    }

    return data;
}

/**
 * Собирает текст уведомления об ошибках формы персонажа. vee-validate отдаёт
 * ошибки по полному пути поля (`states.params.int`), поэтому путь сводится к
 * своему блоку формы по префиксу — иначе вложенные ошибки теряются и
 * уведомление уходит вообще без подробностей. Одинаковые тексты внутри блока
 * схлопываются: восемнадцать навыков не должны давать восемнадцать строк.
 *
 * @param errors Ошибки формы из `useForm`, ключ — путь поля.
 * @returns Текст уведомления: по строке на ошибку, в порядке блоков формы.
 */
export function getCharacterFormErrorText(errors: Record<string, string | undefined>): string {
    const entries = Object.entries(errors);
    const messages = new Set<string>();

    for (const field of CHARACTER_FORM_ORDER) {
        for (const [path, message] of entries) {
            if (message && (path === field || path.startsWith(`${field}.`))) {
                messages.add(message);
            }
        }
    }

    return [...messages].join('<br>');
}
