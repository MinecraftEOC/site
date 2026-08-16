<script setup lang="ts">
import { DOWNLOAD_PAGE } from '~/assets/ts/constants/content/download';
import AccountPageTemplate from '~/components/pages/account/AccountPageTemplate.vue';
import DownloadPlatforms from '~/components/pages/download/DownloadPlatforms.vue';
import DownloadSupport from '~/components/pages/download/DownloadSupport.vue';

definePageMeta({
    layout: 'account',
});
</script>

<template>
    <AccountPageTemplate
        :title="DOWNLOAD_PAGE.title"
        :description="DOWNLOAD_PAGE.description"
        class="DownloadAccountPage"
    >
        <div :class="$style.content">
            <DownloadPlatforms />

            <DownloadSupport />
        </div>
    </AccountPageTemplate>
</template>

<style module lang="scss">
.content {
    display: flex;
    flex-direction: column;
    gap: $space-24;

    @include respond-to(mobile) {
        gap: $space-16;
    }
}
</style>
