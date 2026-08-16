<script setup lang="ts">
import CharacterAdmin from '~/components/pages/account/admin/character/CharacterAdmin.vue';

definePageMeta({
    layout: 'account',
    middleware: ['admin', 'character-admin'],
});

const route = useRoute();

const adminCharacterStore = useAdminCharacterStore();

const characterId = computed(() => Number(route.params.id));
</script>

<template>
    <CharacterAdmin
        v-if="adminCharacterStore.character"
        :character="adminCharacterStore.character"
        @updated="adminCharacterStore.fetchById(characterId)"
    />
</template>

<style module lang="scss">
</style>
