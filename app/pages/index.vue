<script setup lang="ts">
import About from '~/components/pages/main/About.vue';
import Advantages from '~/components/pages/main/Advantages.vue';
import Hero from '~/components/pages/main/Hero.vue';
import HowPlay from '~/components/pages/main/HowPlay.vue';
import Rules from '~/components/pages/main/Rules.vue';
</script>

<template>
    <div :class="$style.Page">
        <Hero />
        <About />
        <Advantages />
        <Rules />
        <HowPlay />
    </div>
</template>

<style module lang="scss">
.Page {
    //
}
</style>
