<script setup lang="ts">
import { HERO } from '~/assets/ts/constants/content/main';
import { ETag } from '~/assets/ts/enums/common';
</script>

<template>
    <div :class="$style.Hero">
        <div :class="$style.overlay" />

        <div class="container">
            <div :class="$style.container">
                <h1 :class="$style.title" v-html="HERO.title" />
                <div :class="$style.description" v-html="HERO.description" />

                <VButton
                    href="#game"
                    :tag="ETag.Link"
                    :class="$style.button"
                >
                    {{ HERO.button }}
                </VButton>
            </div>
        </div>
    </div>
</template>

<style module lang="scss">
.Hero {
    position: relative;
    width: 100%;
    height: calc(100vh - $header-h);
    background: url('~/assets/images/hero_bg.png') no-repeat center center fixed;
    background-size: cover;

    @include respond-to(tablet) {
        height: auto;
    }
}

.container {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 100vh;
    padding-bottom: 10rem;

    @include respond-to(tablet) {
        padding: 12.8rem 0;
    }

    @include respond-to(mobile) {
        padding: $space-64 0;
    }
}

.title {
    @include h1;

    margin-bottom: $space-32;
    color: $text-inverse;

    @include respond-to(tablet) {
        @include h2;

        margin-bottom: $space-24;
    }

    @include respond-to(mobile) {
        @include h3;
    }
}

.description {
    @include t1;

    max-width: 60%;
    margin-bottom: $space-24;
    color: $text-inverse-strong;

    @include respond-to(tablet) {
        max-width: 80%;
    }

    @include respond-to(mobile) {
        @include t2;

        max-width: 100%;
    }
}

.button {
    width: rem(180);

    @include respond-to(mobile) {
        width: 100%;
    }
}

.overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: $overlay-50;
}
</style>
