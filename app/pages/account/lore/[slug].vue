<script setup lang="ts">
import { ContentType } from '~~/generated/prisma/enums';

import ContentDetail from '~/components/pages/content/ContentDetail.vue';

definePageMeta({
    layout: 'account',
});

const route = useRoute();

const slug = computed(() => String(route.params.slug));
</script>

<template>
    <ContentDetail
        :type="ContentType.LORE"
        :slug="slug"
        account
    />
</template>

<style module lang="scss">
</style>
