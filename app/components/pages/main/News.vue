<script setup lang="ts">
import type { IContentItemResponse } from '~~/shared/@types/response';

import { ContentType } from '~~/generated/prisma/enums';
import { CONTENT_ROUTES } from '~/assets/ts/constants/content-entry';
import { NEWS, NEWS_COUNT } from '~/assets/ts/constants/content/main';
import { EColor, ETag } from '~/assets/ts/enums/common';

import ContentGrid from '~/components/pages/content/ContentGrid.vue';

import { useContentApi } from '~/composables/api/useContentApi';

const { list } = useContentApi();

const routes = CONTENT_ROUTES[ContentType.NEWS];

const { data: entries } = await useAsyncData(
    'main-news',
    () => list(ContentType.NEWS, { take: NEWS_COUNT }),
    { default: (): IContentItemResponse[] => [] },
);
</script>

<template>
    <div v-if="entries.length" :class="$style.News">
        <div class="container">
            <div :class="$style.container">
                <div :class="$style.preTitle" v-html="NEWS.pretitle" />
                <h2 :class="$style.title" v-html="NEWS.title" />
                <div :class="$style.description" v-html="NEWS.description" />

                <ContentGrid
                    :entries="entries"
                    :routes="routes"
                    :class="$style.grid"
                />

                <div :class="$style.buttonWrapper">
                    <VButton
                        :to="routes.list"
                        :tag="ETag.NuxtLink"
                        :color="EColor.Secondary"
                        :class="$style.button"
                    >
                        {{ NEWS.button }}
                    </VButton>
                </div>
            </div>
        </div>
    </div>
</template>

<style module lang="scss">
.News {
    width: 100%;
}

.container {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 100%;
    padding: $space-48 0;

    @include respond-to(mobile) {
        padding: $space-32 0;
    }
}

.preTitle {
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

    margin-bottom: $space-24;
    color: $text-secondary;
}

.grid {
    margin-bottom: $space-32;

    @include respond-to(mobile) {
        margin-bottom: $space-24;
    }
}

.buttonWrapper {
    display: flex;
    justify-content: center;
    width: 100%;
}

.button {
    width: max-content;

    @include respond-to(mobile) {
        width: auto;
    }
}
</style>
