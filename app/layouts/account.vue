<script setup lang="ts">
import NotificationsList from '~/components/common/NotificationsList.vue';
import TheAccountSidebar from '~/components/layouts/TheAccountSidebar.vue';
</script>

<template>
    <div :class="$style.main">
        <TheAccountSidebar />

        <slot />

        <NotificationsList />
    </div>
</template>

<style module lang="scss">
.main {
    position: relative;
    min-height: 100dvh;
    padding-left: 32rem;

    @include respond-to(tablet) {
        padding-top: $header-h;
        padding-left: 0;
    }

    @include respond-to(mobile) {
        padding-top: $header-mobile-h;
    }
}
</style>
