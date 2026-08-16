<script setup lang="ts">
import { DOWNLOAD_SUPPORT } from '~/assets/ts/constants/content/download';
import { DISCORD_SUPPORT_CHANNEL } from '~/assets/ts/constants/download';
import { ETag } from '~/assets/ts/enums/common';
</script>

<template>
    <div :class="$style.DownloadSupport">
        <div :class="$style.iconWrapper">
            <VIcon name="info" :size="24" />
        </div>

        <div :class="$style.content">
            <div :class="$style.title">
                {{ DOWNLOAD_SUPPORT.title }}
            </div>

            <div :class="$style.description">
                {{ DOWNLOAD_SUPPORT.description }}
            </div>
        </div>

        <VButton
            :tag="ETag.Link"
            :href="DISCORD_SUPPORT_CHANNEL"
            :class="$style.button"
            icon="simple-icons:discord"
            target="_blank"
        >
            {{ DOWNLOAD_SUPPORT.button }}
        </VButton>
    </div>
</template>

<style module lang="scss">
.DownloadSupport {
    display: flex;
    gap: $space-16;
    align-items: center;
    width: 100%;
    padding: $space-24;
    border: 1px solid $border-subtle;
    border-radius: $radius-12;
    background-color: $surface-sunken;

    @include respond-to(mobile) {
        flex-direction: column;
        align-items: flex-start;
        padding: $space-16;
    }
}

.iconWrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    min-width: $space-48;
    height: $space-48;
    border-radius: 50%;
    background-color: $surface-raised;
    color: $text-link;
}

.content {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: $space-4;
}

.title {
    @include h4;
}

.description {
    @include t3;

    color: $text-secondary;
}

.button {
    flex-shrink: 0;

    @include respond-to(mobile) {
        width: 100%;
    }
}
</style>
