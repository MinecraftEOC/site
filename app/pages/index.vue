<script setup lang="ts">
import About from '~/components/pages/main/About.vue';
import Hero from '~/components/pages/main/Hero.vue';
</script>

<template>
    <div :class="$style.Page">
        <Hero />
        <About />
    </div>
</template>

<style module lang="scss">
.Page {
    //
}
</style>
