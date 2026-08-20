<script setup lang="ts">
import type { IContentItemResponse } from '~~/shared/@types/response';
import type { IContentEmptyState, IContentSectionRoutes } from '~/@types/content';

import ContentCard from '~/components/pages/content/ContentCard.vue';

interface IProps {
    /** Материалы раздела: свежие сверху */
    entries: IContentItemResponse[];
    /** Адреса раздела — из них берётся ссылка на детальную страницу */
    routes: IContentSectionRoutes;
    /** Заглушка, когда материалов нет */
    empty: IContentEmptyState;
}

const props = defineProps<IProps>();

const EMPTY_ICON_SIZE = 28;
</script>

<template>
    <div v-if="props.entries.length" :class="$style.ContentGrid">
        <ContentCard
            v-for="entry in props.entries"
            :key="entry.id"
            :entry="entry"
            :to="props.routes.entry(entry.slug)"
        />
    </div>

    <div v-else :class="$style.empty">
        <div :class="$style.emptyIconWrapper">
            <VIcon :name="props.empty.icon" :size="EMPTY_ICON_SIZE" />
        </div>

        <div :class="$style.emptyTitle">
            {{ props.empty.title }}
        </div>

        <div :class="$style.emptyDescription">
            {{ props.empty.description }}
        </div>
    </div>
</template>

<style module lang="scss">
.ContentGrid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: $space-24;

    @include respond-to(laptop) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    @include respond-to(mobile) {
        grid-template-columns: minmax(0, 1fr);
        gap: $space-16;
    }
}

.empty {
    display: flex;
    flex-direction: column;
    gap: $space-8;
    justify-content: center;
    align-items: center;
    padding: $space-64 $space-24;
    border: 1px solid $border-subtle;
    border-radius: $radius-12;
    background-color: $surface-raised;
    text-align: center;

    @include respond-to(mobile) {
        padding: $space-32 $space-16;
    }
}

.emptyIconWrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    width: $space-64;
    height: $space-64;
    margin-bottom: $space-8;
    border-radius: 50%;
    background-color: $surface-sunken;
    color: $text-link;
}

.emptyTitle {
    @include h4;
}

.emptyDescription {
    @include t3;

    color: $text-secondary;
}
</style>
