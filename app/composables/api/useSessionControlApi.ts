import type { ISessionControlResponse, ISessionJobState, ISessionStartParams } from '~~/shared/@types/session-control';

import { AUTH_ROUTES } from '~/assets/ts/constants/routes';

const SESSION_PATH = '/api/admin/session';

/** Запросы управления сессией с передачей cookie при SSR. */
export function useSessionControlApi() {
    const requestFetch = useRequestFetch();
    const userStore = useUserStore();
    const router = useRouter();

    /** Сбрасывает авторизацию при истечении сессии сайта. Остальные ошибки выводит страница. */
    function onResponseError({ response }: { response: { status: number } }) {
        if (import.meta.client && response.status === 401) {
            userStore.reset();
            void router.push(AUTH_ROUTES.root);
        }
    }

    return {
        get: (signal?: AbortSignal) => requestFetch<ISessionControlResponse>(SESSION_PATH, {
            signal,
            retry: 0,
            onResponseError,
        }),

        start: (params: ISessionStartParams) => requestFetch<{ job: ISessionJobState }>(`${SESSION_PATH}/start`, {
            method: 'POST',
            body: params,
            retry: 0,
            onResponseError,
        }),

        stop: () => requestFetch<{ job: ISessionJobState }>(`${SESSION_PATH}/stop`, {
            method: 'POST',
            retry: 0,
            onResponseError,
        }),
    };
}
