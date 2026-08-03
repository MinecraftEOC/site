<script setup lang="ts">
interface IProps {
    /** Имя иконки в кружке над заголовком */
    icon: string;
    /** Заголовок заглушки */
    title: string;
    /** Пояснение под заголовком */
    description: string;
}

defineProps<IProps>();
</script>

<template>
    <div :class="$style.AccountEmptyState">
        <div :class="$style.iconWrapper">
            <VIcon :name="icon" size="28" />
        </div>

        <div :class="$style.title" v-html="title" />
        <div :class="$style.description" v-html="description" />

        <slot />
    </div>
</template>

<style module lang="scss">
.AccountEmptyState {
    display: flex;
    flex: 1;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
}

.iconWrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    width: rem(64);
    height: rem(64);
    margin-bottom: $space-16;
    border-radius: 50%;
    background-color: $surface-sunken;
    color: $text-link;

    @include respond-to(mobile) {
        width: rem(56);
        height: rem(56);
        margin-bottom: $space-12;
    }
}

.title {
    @include h3;

    margin-bottom: $space-8;
    text-align: center;

    @include respond-to(mobile) {
        @include h4;
    }
}

.description {
    @include t2;

    margin-bottom: $space-16;
    color: $text-secondary;
    text-align: center;

    @include respond-to(mobile) {
        @include t3;
    }
}
</style>
