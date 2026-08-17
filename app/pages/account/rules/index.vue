<script setup lang="ts">
import rulesContent from '~~/content/rules.md';
import AccountPageTemplate from '~/components/pages/account/AccountPageTemplate.vue';

definePageMeta({
    layout: 'account',
});
</script>

<template>
    <AccountPageTemplate class="RulesAccountPage">
        <VMarkdown :class="$style.content" :content="rulesContent" />
    </AccountPageTemplate>
</template>

<style module lang="scss">
.content {
    max-width: rem(860);
}
</style>
