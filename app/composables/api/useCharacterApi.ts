import type { ICharacterResponse, ISuccessResponse } from '~~/shared/@types/response';
import type { TCharacterStatusBody } from '~~/shared/schemas/character';
import type { TCharacterForm } from '~/@types/character';

const CHARACTER_PATH = '/api/character';
const SKIN_PATH = `${CHARACTER_PATH}/skin`;
const STATUS_PATH = `${CHARACTER_PATH}/status`;

export function useCharacterApi() {
    const { $api } = useNuxtApp();

    return {
        getById: (id: number) => $api<ICharacterResponse>(`${CHARACTER_PATH}/${id}`),

        create: (form: TCharacterForm) => $api<ICharacterResponse>(CHARACTER_PATH, { method: 'POST', body: toCharacterFormData(form) }),

        update: (id: number, form: TCharacterForm) => $api<ICharacterResponse>(`${CHARACTER_PATH}/${id}`, { method: 'PATCH', body: toCharacterFormData(form) }),

        addSkins: (id: number, files: File[]) => $api<ICharacterResponse>(`${CHARACTER_PATH}/${id}/skin`, { method: 'POST', body: toSkinsFormData(files) }),

        deleteSkin: (id: number) => $api<ISuccessResponse>(`${SKIN_PATH}/${id}`, { method: 'DELETE' }),

        updateStatus: (body: TCharacterStatusBody) => $api<ICharacterResponse>(STATUS_PATH, { method: 'PATCH', body }),
    };
}
