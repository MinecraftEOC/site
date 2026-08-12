<script setup lang="ts">
import { CHARACTER_EDITABLE_STATUSES } from '~~/shared/constants/character';

import Character from '~/components/pages/account/character/Character.vue';
import CharacterEdit from '~/components/pages/account/character/CharacterEdit.vue';

definePageMeta({
    layout: 'account',
    middleware: 'character-own',
});

const route = useRoute();

const userStore = useUserStore();

const character = computed(() => userStore.getCharacterById(Number(route.params.id)));

const isEditable = computed(() => !!character.value && CHARACTER_EDITABLE_STATUSES.includes(character.value.status));
</script>

<template>
    <template v-if="character">
        <CharacterEdit v-if="isEditable" :character="character" />

        <Character v-else :character="character" />
    </template>
</template>

<style module lang="scss">
</style>
