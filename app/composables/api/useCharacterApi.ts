import type { ICharacterResponse } from '~~/shared/@types/response';
import type { TCharacterForm } from '~/@types/character';

const CHARACTER_PATH = '/api/character';

export function useCharacterApi() {
    const { $api } = useNuxtApp();

    return {
        create: (form: TCharacterForm) => $api<ICharacterResponse>(CHARACTER_PATH, { method: 'POST', body: toCharacterFormData(form) }),

        update: (form: TCharacterForm) => $api<ICharacterResponse>(CHARACTER_PATH, { method: 'PATCH', body: toCharacterFormData(form) }),
    };
}
