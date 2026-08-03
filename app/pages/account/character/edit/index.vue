<script setup lang="ts">
import { CHARACTER_EDIT } from '~/assets/ts/constants/content/account';

import AccountPageTemplate from '~/components/pages/account/AccountPageTemplate.vue';

definePageMeta({
    layout: 'account',
    middleware: 'character-edit',
});
</script>

<template>
    <AccountPageTemplate
        :title="CHARACTER_EDIT.title"
        :description="CHARACTER_EDIT.description"
        class="CharacterEditAccountPage"
    />
</template>

<style module lang="scss">
</style>
