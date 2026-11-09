<script setup lang="ts">
import LogsAdmin from '~/components/pages/account/admin/logs/LogsAdmin.vue';

definePageMeta({
    layout: 'account',
    middleware: 'admin',
});
</script>

<template>
    <LogsAdmin />
</template>

<style module lang="scss">
</style>
