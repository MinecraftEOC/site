<script setup lang="ts">
interface IProps {
    /** HTML-строка, собранная из `.md`-файла на этапе сборки */
    content: string;
}

const props = defineProps<IProps>();
</script>

<template>
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div
        :class="$style.VMarkdown"
        class="v-markdown"
        v-html="props.content"
    />
</template>

<style module lang="scss">
.VMarkdown {
    color: $text-primary;

    @include t2;

    @include respond-to(mobile) {
        @include t3;
    }

    > :first-child {
        margin-top: 0;
    }

    > :last-child {
        margin-bottom: 0;
    }

    h1 {
        margin: $space-40 0 $space-16;

        @include h1;

        @include respond-to(tablet) {
            @include h2;
        }

        @include respond-to(mobile) {
            margin-top: $space-32;

            @include h3;
        }
    }

    h2 {
        margin: $space-40 0 $space-16;

        @include h2;

        @include respond-to(mobile) {
            margin-top: $space-32;

            @include h3;
        }
    }

    h3 {
        margin: $space-32 0 $space-12;

        @include h3;

        @include respond-to(mobile) {
            @include h4;
        }
    }

    h4,
    h5,
    h6 {
        margin: $space-24 0 $space-8;

        @include h5;
    }

    p {
        margin: $space-16 0;
    }

    ul,
    ol {
        margin: $space-16 0;
        padding-left: 0;
        list-style: none;
    }

    ol {
        counter-reset: markdown-item;
    }

    li {
        position: relative;
        margin-bottom: $space-8;
        padding-left: $space-28;

        &:last-child {
            margin-bottom: 0;
        }

        > ul,
        > ol {
            margin: $space-8 0 0;
        }
    }

    ul > li::before {
        content: '';
        position: absolute;
        top: 0.62em;
        left: rem(7);
        width: rem(6);
        height: rem(6);
        border-radius: rem(1);
        background-color: $control-active;
        transform: rotate(45deg);
    }

    ul ul > li::before {
        border: rem(1) solid $control-active;
        background-color: $transparent;
    }

    ol > li {
        counter-increment: markdown-item;

        &::before {
            content: counter(markdown-item) '.';
            position: absolute;
            left: 0;
            width: $space-20;
            color: $control-active;
            font-weight: $fw-bold;
            text-align: right;
        }
    }

    ol ol > li::before {
        content: counter(markdown-item, lower-alpha) ')';
    }

    li p {
        margin: $space-8 0;
    }

    a {
        color: $text-link;
        text-decoration: underline;
        text-underline-offset: rem(3);
        transition: color $default-transition;

        @include hover {
            color: $text-link-hover;
        }
    }

    strong {
        font-weight: $fw-bold;
    }

    em {
        font-style: italic;
    }

    blockquote {
        margin: $space-24 0;
        padding: $space-16 $space-24;
        border-left: rem(3) solid $border;
        border-radius: 0 $radius-8 $radius-8 0;
        background-color: $surface-sunken;
        color: $text-secondary;

        p {
            margin: $space-8 0;
        }
    }

    code {
        padding: rem(2) rem(6);
        border-radius: $radius-4;
        background-color: $surface-sunken;
        color: $text-secondary;

        @include mono2;
    }

    pre {
        overflow-x: auto;
        margin: $space-24 0;
        padding: $space-16;
        border: rem(1) solid $border-subtle;
        border-radius: $radius-8;
        background-color: $surface-sunken;

        code {
            padding: 0;
            background-color: $transparent;
            color: $text-primary;
        }
    }

    hr {
        margin: $space-32 0;
        border: none;
        border-top: rem(1) solid $border-subtle;
    }

    img {
        max-width: 100%;
        height: auto;
        margin: $space-24 0;
        border-radius: $radius-8;
    }

    table {
        display: block;
        overflow-x: auto;
        width: 100%;
        margin: $space-24 0;
        border-collapse: collapse;
        white-space: nowrap;
    }

    th,
    td {
        padding: $space-12 $space-16;
        border: rem(1) solid $border-subtle;
        text-align: left;
    }

    th {
        background-color: $surface-sunken;

        @include l3;
    }

    td {
        @include t3;
    }
}
</style>
