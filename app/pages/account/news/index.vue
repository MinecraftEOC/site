<script setup lang="ts">
import { ContentType } from '~~/generated/prisma/enums';

import ContentList from '~/components/pages/content/ContentList.vue';

definePageMeta({
    layout: 'account',
});
</script>

<template>
    <ContentList :type="ContentType.NEWS" account />
</template>

<style module lang="scss">
</style>
