<script setup lang="ts">
import { ContentType } from '~~/generated/prisma/enums';

import ContentDetail from '~/components/pages/content/ContentDetail.vue';

const route = useRoute();

const slug = computed(() => String(route.params.slug));
</script>

<template>
    <ContentDetail :type="ContentType.NEWS" :slug="slug" />
</template>

<style module lang="scss">
</style>
