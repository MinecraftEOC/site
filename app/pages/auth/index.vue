<script setup lang="ts">
import Auth from '~/components/pages/auth/Auth.vue';

definePageMeta({
    layout: 'auth',
    middleware: 'guest',
});
</script>

<template>
    <div class="AuthPage">
        <Auth />
    </div>
</template>
