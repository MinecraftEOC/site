<script setup lang="ts">
import type { ContentType } from '~~/generated/prisma/enums';

import { CONTENT_ACCOUNT_ROUTES, CONTENT_ROUTES } from '~/assets/ts/constants/content-entry';
import { CONTENT_ENTRY_PAGE, CONTENT_PAGE } from '~/assets/ts/constants/content/entries';

import AccountPageTemplate from '~/components/pages/account/AccountPageTemplate.vue';
import ContentArticle from '~/components/pages/content/ContentArticle.vue';

import { useContentApi } from '~/composables/api/useContentApi';

interface IProps {
    /** Раздел материала */
    type: ContentType;
    /** Слаг материала из адреса страницы */
    slug: string;
    /** Страница открыта в кабинете: меняются обёртка и адреса ссылок */
    account?: boolean;
}

const props = withDefaults(defineProps<IProps>(), {
    account: false,
});

const { get } = useContentApi();

const page = computed(() => CONTENT_PAGE[props.type]);

const routes = computed(() => props.account ? CONTENT_ACCOUNT_ROUTES[props.type] : CONTENT_ROUTES[props.type]);

const { data: entry, error } = await useAsyncData(`content-${props.type}-${props.slug}`, () => get(props.type, props.slug));

if (error.value || !entry.value) {
    throw showError({
        statusCode: error.value?.statusCode ?? 404,
        statusMessage: getApiErrorMessage(error.value, CONTENT_ENTRY_PAGE.entryLoadError),
    });
}

const description = computed(() => entry.value?.description || page.value.metaDescription);

useHead({
    title: entry.value.title,

    meta: [
        { name: 'description', content: description },
    ],
});
</script>

<template>
    <AccountPageTemplate v-if="props.account && entry">
        <ContentArticle
            :entry="entry"
            :page="page"
            :routes="routes"
        />
    </AccountPageTemplate>

    <div v-else-if="entry" :class="$style.ContentDetail">
        <div class="container" :class="$style.container">
            <ContentArticle
                :entry="entry"
                :page="page"
                :routes="routes"
            />
        </div>
    </div>
</template>

<style module lang="scss">
.ContentDetail {
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
</style>
