<script setup lang="ts">
import type { IContentResponse } from '~~/shared/@types/response';
import type { IContentPage, IContentSectionRoutes } from '~/@types/content';

import { CONTENT_ENTRY_PAGE } from '~/assets/ts/constants/content/entries';
import { EColor, ETag } from '~/assets/ts/enums/common';

interface IProps {
    /** Материал вместе с разметкой текста */
    entry: IContentResponse;
    /** Тексты раздела: подпись кнопки возврата */
    page: IContentPage;
    /** Адреса раздела — из них берётся ссылка на список */
    routes: IContentSectionRoutes;
}

const props = defineProps<IProps>();
</script>

<template>
    <article :class="$style.ContentArticle">
        <VButton
            :tag="ETag.NuxtLink"
            :to="props.routes.list"
            :color="EColor.Secondary"
            icon="arrow-left"
            :class="$style.backButton"
        >
            {{ props.page.backButton }}
        </VButton>

        <div :class="$style.date">
            {{ CONTENT_ENTRY_PAGE.dateLabel }} {{ formatDate(props.entry.createdAt) }}
        </div>

        <h1 :class="$style.title">
            {{ props.entry.title }}
        </h1>

        <div v-if="props.entry.description" :class="$style.lead">
            {{ props.entry.description }}
        </div>

        <img
            :src="getContentImageUrl(props.entry.image)"
            :alt="props.entry.title"
            :class="$style.image"
        >

        <VMarkdown :content="props.entry.html" :class="$style.content" />
    </article>
</template>

<style module lang="scss">
.ContentArticle {
    display: flex;
    flex-direction: column;
    max-width: rem(860);
}

.backButton {
    align-self: flex-start;
    margin-bottom: $space-32;

    @include respond-to(mobile) {
        margin-bottom: $space-24;
    }
}

.date {
    @include l4;

    margin-bottom: $space-8;
    color: $text-muted;
    text-transform: uppercase;
}

.title {
    @include h1;

    @include respond-to(tablet) {
        @include h2;
    }

    @include respond-to(mobile) {
        @include h3;
    }
}

.lead {
    @include t1;

    margin-top: $space-12;
    color: $text-secondary;

    @include respond-to(mobile) {
        @include t2;
    }
}

.image {
    object-fit: cover;
    width: 100%;
    margin-top: $space-32;
    border-radius: $radius-12;

    @include respond-to(mobile) {
        margin-top: $space-24;
    }
}

.content {
    margin-top: $space-32;

    @include respond-to(mobile) {
        margin-top: $space-24;
    }
}
</style>
