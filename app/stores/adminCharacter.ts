import type { ICharacter } from '~~/shared/@types/user';

import { useCharacterApi } from '~/composables/api/useCharacterApi';

/**
 * Персонаж, открытый в админском разделе.
 *
 * Живёт в сторе, а не в `useAsyncData` страницы, потому что нужен не только
 * самой странице: сайдбар рисует подпункт с именем персонажа под «Списком
 * игроков». Загрузкой занимается middleware `character-admin`, так что данные
 * готовы ещё до рендера — и на сервере тоже.
 */
export const useAdminCharacterStore = defineStore('adminCharacter', () => {
    const api = useCharacterApi();

    const character = ref<ICharacter | null>(null);

    async function fetchById(id: number) {
        character.value = await api.getById(id);
    }

    function reset() {
        character.value = null;
    }

    return {
        character,

        fetchById,
        reset,
    };
});
