import type { IUser } from '~~/shared/@types/user';
import type { TLoginBody } from '~~/shared/schemas/auth';

import { DiscordLinkStatus, UserRole } from '~~/generated/prisma/enums';
import { isCharacterLive } from '~~/shared/constants/character';
import { useAuthApi } from '~/composables/api/useAuthApi';

export const useUserStore = defineStore('user', () => {
    const api = useAuthApi();

    const user = ref<IUser | null>(null);
    const isAdmin = computed(() => user.value?.role === UserRole.ADMIN);
    const isAuthenticated = computed(() => !!user.value);
    const isDiscordLinked = computed(() => user.value?.discordAccount?.status === DiscordLinkStatus.LINKED);
    const characters = computed(() => user.value?.characters ?? []);
    const hasLiveCharacter = computed(() => characters.value.some(character => isCharacterLive(character.status)));

    function getCharacterById(id: number | string) {
        return characters.value.find(character => character.id === Number(id)) ?? null;
    }

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
        await navigateTo('/');
    }

    function reset() {
        user.value = null;
    }

    return {
        user,
        isAdmin,
        isAuthenticated,
        isDiscordLinked,
        characters,
        hasLiveCharacter,

        getCharacterById,
        fetchMe,
        reset,
        login,
        logout,
    };
});
