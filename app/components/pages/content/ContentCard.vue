<script setup lang="ts">
import type { IContentItemResponse } from '~~/shared/@types/response';

interface IProps {
    /** Материал, выводимый карточкой */
    entry: IContentItemResponse;
    /** Адрес детальной страницы материала */
    to: string;
}

const props = defineProps<IProps>();
</script>

<template>
    <NuxtLink :to="props.to" :class="$style.ContentCard">
        <div :class="$style.imageWrapper">
            <img
                :src="getContentImageUrl(props.entry.image)"
                :alt="props.entry.title"
                loading="lazy"
                :class="$style.image"
            >
        </div>

        <div :class="$style.content">
            <div :class="$style.date">
                {{ formatDate(props.entry.createdAt) }}
            </div>

            <h2 :class="$style.title">
                {{ props.entry.title }}
            </h2>

            <div v-if="props.entry.description" :class="$style.description">
                {{ props.entry.description }}
            </div>
        </div>
    </NuxtLink>
</template>

<style module lang="scss">
.ContentCard {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border: 1px solid $border-subtle;
    border-radius: $radius-12;
    background-color: $surface-raised;
    transition: border-color $default-transition, transform $default-transition;

    @include hover {
        border-color: $border-focus;
        transform: translateY(#{rem(-4)});

        .image {
            transform: scale(1.04);
        }
    }
}

.imageWrapper {
    overflow: hidden;
    aspect-ratio: 16 / 9;
    background-color: $surface-sunken;
}

.image {
    object-fit: cover;
    width: 100%;
    height: 100%;
    transition: transform $default-transition;
}

.content {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: $space-8;
    padding: $space-16;
}

.date {
    @include l4;

    color: $text-muted;
    text-transform: uppercase;
}

.title {
    @include h4;
}

.description {
    @include t3;

    color: $text-secondary;
}
</style>
