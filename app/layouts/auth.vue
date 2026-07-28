<script setup lang="ts">
</script>

<template>
    <div :class="$style.main">
        <slot />
    </div>
</template>

<style module lang="scss">
.main {
    min-height: 100dvh;
}
</style>
