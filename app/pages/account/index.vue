<script setup lang="ts">
import CharactersList from '~/components/pages/account/main/CharactersList.vue';
import DiscordLink from '~/components/pages/account/main/DiscordLink.vue';
import EmptyCharacters from '~/components/pages/account/main/EmptyCharacters.vue';

definePageMeta({
    layout: 'account',
});

const userStore = useUserStore();

const pageComponent = computed(() => {
    if (!userStore.isDiscordLinked) {
        return DiscordLink;
    }

    if (!userStore.characters.length) {
        return EmptyCharacters;
    }

    return CharactersList;
});
</script>

<template>
    <div class="AccountPage">
        <component :is="pageComponent" />
    </div>
</template>

<style module lang="scss">
</style>
