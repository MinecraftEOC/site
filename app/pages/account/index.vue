<script setup lang="ts">
import DiscordLink from '~/components/pages/account/main/DiscordLink.vue';

definePageMeta({
    layout: 'account',
});

const userStore = useUserStore();

const pageComponent = computed(() => {
    if (!userStore.isDiscordLinked) {
        return DiscordLink;
    }

    return DiscordLink;
});
</script>

<template>
    <div class="AccountPage">
        <component :is="pageComponent" />
    </div>
</template>

<style module lang="scss">
</style>
