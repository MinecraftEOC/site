<script setup lang="ts">
import { CHARACTER_DETAILS } from '~/assets/ts/constants/content/account';

import AccountPageTemplate from '~/components/pages/account/AccountPageTemplate.vue';

const route = useRoute();

const userStore = useUserStore();

const character = computed(() => userStore.getCharacterById(Number(route.params.id)));

definePageMeta({
    layout: 'account',
    middleware: 'character-own',
});
</script>

<template>
    <AccountPageTemplate :title="character?.username" class="CharacterAccountPage" />
</template>

<style module lang="scss">
</style>
