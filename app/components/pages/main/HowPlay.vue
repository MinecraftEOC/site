<script setup lang="ts">
import { HOW_PLAY } from '~/assets/ts/constants/content/main';
import { ESize, ETag } from '~/assets/ts/enums/common';
</script>

<template>
    <div :class="$style.HowPlay">
        <div class="container">
            <div :class="$style.container">
                <div :class="$style.preTitle" v-html="HOW_PLAY.pretitle" />
                <h2 :class="$style.title" v-html="HOW_PLAY.title" />
                <div :class="$style.description" v-html="HOW_PLAY.description" />

                <div :class="$style.main">
                    <div :class="$style.cards">
                        <div
                            v-for="card in HOW_PLAY.cards"
                            :key="card.title"
                            :class="$style.card"
                        >
                            <div :class="$style.cardHeader">
                                <div :class="$style.cardIconWrapper">
                                    <VIcon :name="card.icon" />
                                </div>

                                <div :class="$style.cardTitle">
                                    {{ card.title }}
                                </div>
                            </div>

                            <div :class="$style.cardDescription">
                                {{ card.description }}
                            </div>

                            <VButton
                                :to="card.button.to"
                                :color="card.button.color"
                                :tag="ETag.NuxtLink"
                                :size="ESize.Small"
                                :class="$style.cardButton"
                            >
                                {{ card.button.title }}
                            </VButton>
                        </div>
                    </div>

                    <div :class="$style.imageWrapper" :style="{ backgroundImage: `url(${HOW_PLAY.imageBlock.image})` }">
                        <div :class="$style.imageOverlay" />

                        <div :class="$style.imageContent">
                            <div :class="$style.imagePretitle" v-html="HOW_PLAY.imageBlock.pretitle" />
                            <div :class="$style.imageTitle" v-html="HOW_PLAY.imageBlock.title" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style module lang="scss">
.HowPlay {
    width: 100%;
    background-color: $surface;
}

.container {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 100%;
    padding: $space-48 0;

    @include respond-to(mobile) {
        padding: $space-32 0;
    }
}

.preTitle {
    @include l4;

    margin-bottom: $space-8;
    color: $text-muted;
    text-transform: uppercase;
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

    margin-bottom: $space-24;
    color: $text-secondary;
}

.main {
    display: flex;
    gap: $space-48;
    align-items: center;

    @include respond-to(tablet) {
        flex-direction: column;
        gap: $space-24;
        align-items: stretch;
    }
}

.cards {
    display: flex;
    flex: 1.5;
    flex-direction: column;
    gap: $space-16;
    width: 100%;

    @include respond-to(tablet) {
        flex-direction: row;
        flex-wrap: wrap;
    }

    @include respond-to(mobile) {
        flex-direction: column;
    }
}

.card {
    gap: $space-8;
    padding: $space-16;
    border: 1px solid $border-subtle;
    border-radius: $radius-8;
    background: $surface-raised;

    @include respond-to(mobile) {
        flex: 1 1 100%;
    }
}

.cardHeader {
    display: flex;
    gap: $space-8;
    align-items: center;
    margin-bottom: $space-8;
}

.cardIconWrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    min-width: $space-32;
    height: $space-32;
    border-radius: $radius-8;
    background: $surface-sunken;
    color: $text-link;
}

.cardTitle {
    @include h4;
}

.cardDescription {
    @include t2;

    margin-bottom: $space-16;
    color: $text-secondary;

    @include respond-to(mobile) {
        @include t3;
    }
}

.cardButton {
    width: max-content;
}

.imageWrapper {
    position: relative;
    display: flex;
    flex: 1;
    align-items: flex-end;
    overflow: hidden;
    height: 55.6rem;
    padding: $space-24;
    border-radius: $radius-16;
    background-position: center;
    background-size: cover;
    background-repeat: no-repeat;

    @include respond-to(tablet) {
        flex: auto;
        width: 100%;
        height: 40rem;
    }

    @include respond-to(mobile) {
        height: 32rem;
    }
}

.imageContent {
    position: relative;
}

.imagePretitle {
    @include l4;

    margin-bottom: $space-4;
    color: $text-inverse-subtle;
    text-transform: uppercase;
}

.imageTitle {
    @include h3;

    max-width: 80%;
    color: $text-inverse;

    @include respond-to(tablet) {
        max-width: none;
    }

    @include respond-to(mobile) {
        @include h4;
    }
}

.imageOverlay {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 35%;
    background: linear-gradient(180deg, #0000 0%, #1A1A1AD9 100%);
}
</style>
