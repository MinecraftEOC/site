import type { IUserResponse } from '~~/shared/@types/response';

const USER_PATH = '/api/user';

export function useUserApi() {
    const { $api } = useNuxtApp();

    return {
        getById: (id: number) => $api<IUserResponse>(USER_PATH, { query: { id } }),

        list: () => $api<IUserResponse[]>(`${USER_PATH}/list`),
    };
}
