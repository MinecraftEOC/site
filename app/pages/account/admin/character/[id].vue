<script setup lang="ts">
import { CHARACTER_ADMIN } from '~/assets/ts/constants/content/account';

import CharacterAdmin from '~/components/pages/account/admin/character/CharacterAdmin.vue';

import { useCharacterApi } from '~/composables/api/useCharacterApi';

definePageMeta({
    layout: 'account',
    middleware: 'admin',
});

const route = useRoute();

const { getById } = useCharacterApi();

const characterId = Number(route.params.id);

const { data: character, error, refresh } = await useAsyncData(`admin-character-${characterId}`, () => getById(characterId));

if (error.value || !character.value) {
    throw showError({
        statusCode: error.value?.statusCode ?? 404,
        statusMessage: getApiErrorMessage(error.value, CHARACTER_ADMIN.loadError),
    });
}
</script>

<template>
    <CharacterAdmin
        v-if="character"
        :character="character"
        @updated="refresh()"
    />
</template>

<style module lang="scss">
</style>
