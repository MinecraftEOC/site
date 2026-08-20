<script setup lang="ts">
import ContentForm from '~/components/pages/account/admin/content/ContentForm.vue';

definePageMeta({
    layout: 'account',
    middleware: 'admin',
});
</script>

<template>
    <ContentForm />
</template>

<style module lang="scss">
</style>
