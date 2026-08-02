<script setup lang="ts">
interface IProps {
    title?: string;
    description?: string;
}

const props = withDefaults(defineProps<IProps>(), {
    title: '',
    description: '',
});

const showHeader = computed(() => props.title || props.description);
</script>

<template>
    <div :class="$style.AccountPageTemplate">
        <div v-if="showHeader" :class="$style.header">
            <div :class="$style.headerLeft">
                <h1
                    v-if="title"
                    :class="$style.title"
                    v-html="props.title"
                />
                <div
                    v-if="description"
                    :class="$style.description"
                    v-html="props.description"
                />
            </div>

            <slot name="header-right" />
        </div>

        <slot />
    </div>
</template>

<style module lang="scss">
.AccountPageTemplate {
    display: flex;
    flex-direction: column;
    gap: $space-48;
    width: 100%;
    min-height: 100dvh;
    padding: $space-64;

    @include respond-to(laptop) {
        padding: $space-48 $space-32;
    }

    @include respond-to(tablet) {
        gap: $space-32;
        min-height: calc(100dvh - #{$header-h});
    }

    @include respond-to(mobile) {
        gap: $space-24;
        min-height: calc(100dvh - #{$header-mobile-h});
        padding: $space-24 $space-16;
    }
}

.header {
    display: flex;
    gap: $space-48;
    justify-content: space-between;

    @include respond-to(tablet) {
        gap: $space-24;
    }

    @include respond-to(mobile) {
        flex-direction: column;
        gap: $space-16;
    }
}

.headerLeft {
    display: flex;
    flex-direction: column;
    gap: $space-8;
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

.description {
    @include t2;

    color: $text-secondary;

    @include respond-to(mobile) {
        @include t3;
    }
}
</style>
