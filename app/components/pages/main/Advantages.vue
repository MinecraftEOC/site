<script setup lang="ts">
import { ADVANTAGES } from '~/assets/ts/constants/content/main';
</script>

<template>
    <div :class="$style.Advantages">
        <div class="container">
            <div :class="$style.container">
                <div :class="$style.header">
                    <div :class="$style.preTitle" v-html="ADVANTAGES.pretitle" />
                    <h2 :class="$style.title" v-html="ADVANTAGES.title" />
                    <div :class="$style.description" v-html="ADVANTAGES.description" />
                </div>

                <div :class="$style.cards">
                    <div
                        v-for="card in ADVANTAGES.cards"
                        :key="card.title"
                        :class="$style.card"
                        :style="{ backgroundImage: `url(${card.image})` }"
                    >
                        <div :class="$style.cardOverlay" />

                        <div :class="$style.cardContent">
                            <div :class="$style.cardType">
                                {{ card.type }}
                            </div>

                            <div :class="$style.cardTitle">
                                {{ card.title }}
                            </div>

                            <div :class="$style.cardDescription">
                                {{ card.description }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style module lang="scss">
.Advantages {
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

.header {
    position: relative;

    @include respond-to(tablet) {
        position: static;
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

    @include respond-to(tablet) {
        @include h2;
    }

    @include respond-to(mobile) {
        @include h3;
    }
}

.description {
    @include t2;

    position: absolute;
    right: 0;
    bottom: 0;
    max-width: 31%;
    color: $text-secondary;
    text-align: right;

    @include respond-to(tablet) {
        position: static;
        max-width: 100%;
        margin-top: $space-16;
        text-align: left;
    }
}

.cards {
    display: grid;
    grid-template-rows: 1fr 1fr;
    grid-template-columns: 1fr 1fr;
    gap: $space-24;
    width: 100%;
    height: 51rem;
    margin-top: $space-32;

    @include respond-to(tablet) {
        gap: $space-16;
        height: 40rem;
    }

    @include respond-to(mobile) {
        grid-template-rows: auto;
        grid-template-columns: 1fr;
        height: auto;
    }
}

.card {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    overflow: hidden;
    padding: $space-24;
    border-radius: $radius-12;
    background-position: center;
    background-size: cover;
    background-repeat: no-repeat;

    &:first-child {
        grid-row: span 2;

        @include respond-to(mobile) {
            grid-row: auto;
        }
    }

    @include respond-to(tablet) {
        padding: $space-16;
    }

    @include respond-to(mobile) {
        min-height: 24rem;
    }
}

.cardContent {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: $space-4;
}

.cardType {
    @include l4;

    color: $text-inverse-subtle;
    text-transform: uppercase;
}

.cardTitle {
    @include h3;

    color: $text-inverse;

    @include respond-to(tablet) {
        @include h4;
    }
}

.cardDescription {
    @include t4;

    color: $text-inverse-muted;
}

.cardOverlay {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 35%;
    background: linear-gradient(180deg, #0000 0%, #1A1A1AD9 100%);
}
</style>
