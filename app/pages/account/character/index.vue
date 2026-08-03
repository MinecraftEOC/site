<script setup lang="ts">
import { CHARACTER_DETAILS } from '~/assets/ts/constants/content/account';

import AccountPageTemplate from '~/components/pages/account/AccountPageTemplate.vue';

definePageMeta({
    layout: 'account',
    middleware: 'character-active',
});
</script>

<template>
    <AccountPageTemplate :title="CHARACTER_DETAILS.title" class="CharacterAccountPage" />
</template>

<style module lang="scss">
</style>
