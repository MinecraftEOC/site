<script setup lang="ts">
import { CHARACTER_CREATE } from '~/assets/ts/constants/content/account';

import AccountPageTemplate from '~/components/pages/account/AccountPageTemplate.vue';

definePageMeta({
    layout: 'account',
    middleware: 'character-create',
});
</script>

<template>
    <AccountPageTemplate
        :title="CHARACTER_CREATE.title"
        :description="CHARACTER_CREATE.description"
        class="CharacterCreateAccountPage"
    />
</template>

<style module lang="scss">
</style>
