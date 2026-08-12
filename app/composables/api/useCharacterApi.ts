import type { ICharacterResponse, ISuccessResponse } from '~~/shared/@types/response';
import type { TCharacterForm } from '~/@types/character';

const CHARACTER_PATH = '/api/character';
const SKIN_PATH = `${CHARACTER_PATH}/skin`;

export function useCharacterApi() {
    const { $api } = useNuxtApp();

    return {
        create: (form: TCharacterForm) => $api<ICharacterResponse>(CHARACTER_PATH, { method: 'POST', body: toCharacterFormData(form) }),

        update: (id: number, form: TCharacterForm) => $api<ICharacterResponse>(`${CHARACTER_PATH}/${id}`, { method: 'PATCH', body: toCharacterFormData(form) }),

        addSkins: (id: number, files: File[]) => $api<ICharacterResponse>(`${CHARACTER_PATH}/${id}/skin`, { method: 'POST', body: toSkinsFormData(files) }),

        deleteSkin: (id: number) => $api<ISuccessResponse>(`${SKIN_PATH}/${id}`, { method: 'DELETE' }),
    };
}
