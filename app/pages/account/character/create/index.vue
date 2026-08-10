<script setup lang="ts">
import CharacterCreate from '~/components/pages/account/character/CharacterCreate.vue';

definePageMeta({
    layout: 'account',
    middleware: 'character-create',
});
</script>

<template>
    <CharacterCreate />
</template>

<style module lang="scss">
</style>
