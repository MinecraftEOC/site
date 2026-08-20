<script setup lang="ts">
import { CONTENT_FORM } from '~/assets/ts/constants/content/account';

import ContentForm from '~/components/pages/account/admin/content/ContentForm.vue';

import { useContentApi } from '~/composables/api/useContentApi';

definePageMeta({
    layout: 'account',
    middleware: 'admin',
});

const route = useRoute();

const { getById } = useContentApi();

const id = computed(() => Number(route.params.id));

const { data: entry, error, refresh } = await useAsyncData(`admin-content-${id.value}`, () => getById(id.value));

if (error.value || !entry.value) {
    throw showError({
        statusCode: error.value?.statusCode ?? 404,
        statusMessage: getApiErrorMessage(error.value, CONTENT_FORM.loadError),
    });
}
</script>

<template>
    <ContentForm
        v-if="entry"
        :key="entry.id"
        :entry="entry"
        @saved="refresh"
    />
</template>

<style module lang="scss">
</style>
