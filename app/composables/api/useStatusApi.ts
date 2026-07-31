import type { IStatusResponse } from '~~/shared/@types/response';

export function useStatusApi() {
    const { $api } = useNuxtApp();

    return {
        status: () => $api<IStatusResponse>('/api/status'),
    };
}
