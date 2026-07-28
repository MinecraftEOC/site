import type { IUser } from '~~/shared/@types/user';
import type { TLoginBody } from '~~/shared/schemas/auth';

import { useAuthApi } from '~/composables/api/useAuthApi';

export const useUserStore = defineStore('user', () => {
    const api = useAuthApi();

    const user = ref<IUser | null>(null);
    const isAuthenticated = computed(() => !!user.value);

    async function fetchMe() {
        try {
            user.value = await api.me();
        } catch {
            user.value = null;
        }

        return isAuthenticated.value;
    }

    async function login(body: TLoginBody) {
        const res = await api.login(body);
        user.value = res;
    }

    async function logout() {
        await api.logout();
        reset();
    }

    function reset() {
        user.value = null;
    }

    return {
        user,
        isAuthenticated,

        fetchMe,
        reset,
        login,
        logout,
    };
});
