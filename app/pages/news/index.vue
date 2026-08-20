<script setup lang="ts">
import { ContentType } from '~~/generated/prisma/enums';

import ContentList from '~/components/pages/content/ContentList.vue';
</script>

<template>
    <ContentList :type="ContentType.NEWS" />
</template>

<style module lang="scss">
</style>
