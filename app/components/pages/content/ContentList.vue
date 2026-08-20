<script setup lang="ts">
import type { ContentType } from '~~/generated/prisma/enums';

import { CONTENT_ACCOUNT_ROUTES, CONTENT_ROUTES } from '~/assets/ts/constants/content-entry';
import { CONTENT_ENTRY_PAGE, CONTENT_PAGE } from '~/assets/ts/constants/content/entries';

import AccountPageTemplate from '~/components/pages/account/AccountPageTemplate.vue';
import ContentGrid from '~/components/pages/content/ContentGrid.vue';

import { useContentApi } from '~/composables/api/useContentApi';

interface IProps {
    /** Раздел материалов */
    type: ContentType;
    /** Страница открыта в кабинете: меняются обёртка и адреса ссылок */
    account?: boolean;
}

const props = withDefaults(defineProps<IProps>(), {
    account: false,
});

const { list } = useContentApi();

const page = computed(() => CONTENT_PAGE[props.type]);

const routes = computed(() => props.account ? CONTENT_ACCOUNT_ROUTES[props.type] : CONTENT_ROUTES[props.type]);

const { data: entries, error } = await useAsyncData(`content-list-${props.type}`, () => list(props.type));

if (error.value || !entries.value) {
    throw showError({
        statusCode: error.value?.statusCode ?? 404,
        statusMessage: getApiErrorMessage(error.value, CONTENT_ENTRY_PAGE.listLoadError),
    });
}

useHead({
    title: page.value.title,

    meta: [
        { name: 'description', content: page.value.metaDescription },
    ],
});
</script>

<template>
    <AccountPageTemplate
        v-if="props.account"
        :title="page.title"
        :description="page.description"
    >
        <ContentGrid
            :entries="entries ?? []"
            :routes="routes"
            :empty="page.empty"
        />
    </AccountPageTemplate>

    <div v-else :class="$style.ContentList">
        <div class="container" :class="$style.container">
            <h1 :class="$style.title">
                {{ page.title }}
            </h1>

            <div :class="$style.description">
                {{ page.description }}
            </div>

            <ContentGrid
                :entries="entries ?? []"
                :routes="routes"
                :empty="page.empty"
                :class="$style.grid"
            />
        </div>
    </div>
</template>

<style module lang="scss">
.ContentList {
    width: 100%;
    min-height: calc(100dvh - #{$header-h});
    background-color: $surface;

    @include respond-to(mobile) {
        min-height: calc(100dvh - #{$header-mobile-h});
    }
}

.container {
    padding-top: $space-64;
    padding-bottom: $space-64;

    @include respond-to(tablet) {
        padding-top: $space-48;
        padding-bottom: $space-48;
    }

    @include respond-to(mobile) {
        padding-top: $space-32;
        padding-bottom: $space-32;
    }
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

    @include respond-to(mobile) {
        @include t2;
    }
}

.grid {
    margin-top: $space-32;

    @include respond-to(mobile) {
        margin-top: $space-24;
    }
}
</style>
