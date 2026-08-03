import type { IUser } from '~~/shared/@types/user';
import type { TLoginBody } from '~~/shared/schemas/auth';

import { CharacterStatus, DiscordLinkStatus } from '~~/generated/prisma/enums';
import { CHARACTER_EDITABLE_STATUSES, isCharacterLive } from '~~/shared/constants/character';
import { useAuthApi } from '~/composables/api/useAuthApi';

export const useUserStore = defineStore('user', () => {
    const api = useAuthApi();

    const user = ref<IUser | null>(null);
    const isAuthenticated = computed(() => !!user.value);
    const isDiscordLinked = computed(() => user.value?.discordAccount?.status === DiscordLinkStatus.LINKED);
    const characters = computed(() => user.value?.characters ?? []);
    const hasLiveCharacter = computed(() => characters.value.some(character => isCharacterLive(character.status)));
    const activeCharacter = computed(() => characters.value.find(character => character.status === CharacterStatus.ACTIVE) ?? null);
    const editableCharacter = computed(() => characters.value.find(character => CHARACTER_EDITABLE_STATUSES.includes(character.status)) ?? null);

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
        isAuthenticated,
        isDiscordLinked,
        characters,
        hasLiveCharacter,
        activeCharacter,
        editableCharacter,

        fetchMe,
        reset,
        login,
        logout,
    };
});
