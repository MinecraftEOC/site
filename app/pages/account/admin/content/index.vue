<script setup lang="ts">
import { CONTENT_ADMIN } from '~/assets/ts/constants/content/account';

import ContentAdmin from '~/components/pages/account/admin/content/ContentAdmin.vue';

import { useContentApi } from '~/composables/api/useContentApi';

definePageMeta({
    layout: 'account',
    middleware: 'admin',
});

const { list } = useContentApi();

const { data: entries, error, refresh } = await useAsyncData('admin-content', () => list());

if (error.value || !entries.value) {
    throw showError({
        statusCode: error.value?.statusCode ?? 404,
        statusMessage: getApiErrorMessage(error.value, CONTENT_ADMIN.loadError),
    });
}
</script>

<template>
    <ContentAdmin
        v-if="entries"
        :entries="entries"
        @refresh="refresh"
    />
</template>

<style module lang="scss">
</style>
