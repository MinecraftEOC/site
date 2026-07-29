<script setup lang="ts">
import NotificationsList from '~/components/common/NotificationsList.vue';
</script>

<template>
    <div :class="$style.main">
        <slot />

        <NotificationsList />
    </div>
</template>

<style module lang="scss">
.main {
    position: relative;
    min-height: 100dvh;
}
</style>
