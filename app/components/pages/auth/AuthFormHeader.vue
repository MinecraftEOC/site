<script setup lang="ts">
interface IProps {
    pretitle: string;
    title: string;
    description: string;
}

const props = defineProps<IProps>();
</script>

<template>
    <div :class="$style.AuthFormHeader">
        <div :class="$style.pretitle" v-html="props.pretitle" />
        <h2 :class="$style.title" v-html="props.title" />
        <div :class="$style.description" v-html="props.description" />
    </div>
</template>

<style module lang="scss">
.AuthFormHeader {
    display: flex;
    flex-direction: column;
    gap: $space-8;
}

.pretitle {
    @include l4;

    color: $text-muted;
    text-transform: uppercase;
}

.title {
    @include h2;

    @include respond-to(mobile) {
        @include h3;
    }
}

.description {
    @include t2;

    color: $text-secondary;
}
</style>
