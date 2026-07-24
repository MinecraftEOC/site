<script setup lang="ts">
import { RULES } from '~/assets/ts/constants/content/main';
import { ETag } from '~/assets/ts/enums/common';
</script>

<template>
    <div :class="$style.Rules">
        <div class="container">
            <div :class="$style.container">
                <div :class="$style.preTitle" v-html="RULES.pretitle" />
                <h2 :class="$style.title" v-html="RULES.title" />

                <div :class="$style.cards">
                    <div
                        v-for="(card, index) in RULES.cards"
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

                            <span :class="$style.cardNumber">
                                0{{ index + 1 }}
                            </span>
                        </div>

                        <div :class="$style.cardDescription">
                            {{ card.description }}
                        </div>
                    </div>
                </div>

                <div :class="$style.buttonWrapper">
                    <VButton
                        to="/rules"
                        :tag="ETag.NuxtLink"
                        :class="$style.button"
                    >
                        {{ RULES.button }}
                    </VButton>
                </div>
            </div>
        </div>
    </div>
</template>

<style module lang="scss">
.Rules {
    width: 100%;
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

    margin-bottom: $space-32;

    @include respond-to(tablet) {
        @include h2;
    }

    @include respond-to(mobile) {
        @include h3;

        margin-bottom: $space-24;
    }
}

.buttonWrapper {
    display: flex;
    justify-content: center;
    width: 100%;
}

.button {
    width: max-content;

    @include respond-to(mobile) {
        width: auto;
    }
}

.cards {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: $space-16;
    width: 100%;
    margin-bottom: $space-32;

    @include respond-to(tablet) {
        grid-template-columns: repeat(2, 1fr);
    }

    @include respond-to(mobile) {
        grid-template-columns: 1fr;
    }
}

.card {
    gap: $space-8;
    min-height: 18rem;
    padding: $space-16;
    border: 1px solid $border-subtle;
    border-radius: $radius-8;
    background: $surface-raised;

    @include respond-to(mobile) {
        min-height: auto;
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

    color: $text-secondary;

    @include respond-to(mobile) {
        @include t3;
    }
}

.cardNumber {
    @include mono;

    margin-left: auto;
    color: $text-link;
}
</style>
