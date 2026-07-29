<script setup lang="ts">
import NotificationsList from '~/components/common/NotificationsList.vue';
import TheFooter from '~/components/layouts/TheFooter.vue';
import TheHeader from '~/components/layouts/TheHeader.vue';
</script>

<template>
    <TheHeader has-menu />

    <div :class="$style.main">
        <slot />

        <NotificationsList />
    </div>

    <TheFooter />
</template>

<style module lang="scss">
.main {
    position: relative;
    min-height: 100dvh;
    padding-top: $header-h;

    @include respond-to(mobile) {
        padding-top: $header-mobile-h;
    }
}
</style>
