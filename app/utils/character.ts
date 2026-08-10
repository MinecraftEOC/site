import type { TCharacterForm } from '~/@types/character';

import { CHARACTER_FORM_FIELDS } from '~~/shared/constants/character';
import { SKIN_FORM_FIELD } from '~~/shared/constants/skin';

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
