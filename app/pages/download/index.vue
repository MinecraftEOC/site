<script setup lang="ts">
import { DOWNLOAD_META, DOWNLOAD_PAGE } from '~/assets/ts/constants/content/download';
import DownloadPlatforms from '~/components/pages/download/DownloadPlatforms.vue';
import DownloadSupport from '~/components/pages/download/DownloadSupport.vue';

useHead({
    title: DOWNLOAD_META.title,
    meta: [
        { name: 'description', content: DOWNLOAD_META.description },
    ],
});
</script>

<template>
    <div :class="$style.DownloadPage">
        <div class="container">
            <div :class="$style.container">
                <div :class="$style.pretitle" v-html="DOWNLOAD_PAGE.pretitle" />
                <h1 :class="$style.title" v-html="DOWNLOAD_PAGE.title" />
                <div :class="$style.description" v-html="DOWNLOAD_PAGE.description" />

                <DownloadPlatforms :class="$style.platforms" />

                <DownloadSupport :class="$style.support" />
            </div>
        </div>
    </div>
</template>

<style module lang="scss">
.DownloadPage {
    width: 100%;
    min-height: calc(100dvh - #{$header-h});
    background-color: $surface;

    @include respond-to(mobile) {
        min-height: calc(100dvh - #{$header-mobile-h});
    }
}

.container {
    display: flex;
    flex-direction: column;
    padding: $space-64 0;

    @include respond-to(tablet) {
        padding: $space-48 0;
    }

    @include respond-to(mobile) {
        padding: $space-32 0;
    }
}

.pretitle {
    @include l4;

    margin-bottom: $space-8;
    color: $text-muted;
    text-transform: uppercase;
}

.title {
    @include h1;

    margin-bottom: $space-8;

    @include respond-to(tablet) {
        @include h2;
    }

    @include respond-to(mobile) {
        @include h3;
    }
}

.description {
    @include t1;

    color: $text-secondary;

    @include respond-to(tablet) {
        max-width: 100%;
    }

    @include respond-to(mobile) {
        @include t2;
    }
}

.platforms {
    margin-top: $space-32;

    @include respond-to(mobile) {
        margin-top: $space-24;
    }
}

.support {
    margin-top: $space-24;

    @include respond-to(mobile) {
        margin-top: $space-16;
    }
}
</style>
