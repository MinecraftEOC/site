<script setup lang="ts">
import { ABOUT } from '~/assets/ts/constants/content/main';
import { EColor, ETag } from '~/assets/ts/enums/common';
</script>

<template>
    <div :class="$style.About">
        <div class="container">
            <div :class="$style.container">
                <div :class="$style.preTitle" v-html="ABOUT.pretitle" />
                <h2 :class="$style.title" v-html="ABOUT.title" />

                <div :class="$style.main">
                    <div :class="$style.content">
                        <h3 :class="$style.subtitle" v-html="ABOUT.subtitle" />
                        <div :class="$style.description" v-html="ABOUT.description" />

                        <VButton
                            to="/lore"
                            :tag="ETag.NuxtLink"
                            :color="EColor.Secondary"
                            :class="$style.button"
                        >
                            {{ ABOUT.button }}
                        </VButton>
                    </div>

                    <div :class="$style.imageWrapper">
                        <img src="~/assets/images/hero_bg.png">
                    </div>
                </div>

                <div :class="$style.cards">
                    <div
                        v-for="card in ABOUT.cards"
                        :key="card.title"
                        :class="$style.card"
                    >
                        <div :class="$style.cardIconWrapper">
                            <VIcon :name="card.icon" />
                        </div>

                        <div>
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
.About {
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

.main {
    display: flex;
    gap: $space-48;
    justify-content: space-between;

    @include respond-to(tablet) {
        flex-direction: column;
        gap: $space-24;
    }
}

.content {
    flex: 1.3;
}

.imageWrapper {
    flex: 1;

    img {
        object-fit: cover;
        width: 100%;
        height: 100%;
        border-radius: $radius-16;
    }

    @include respond-to(mobile) {
        display: none;
    }
}

.subtitle {
    @include h3;

    @include respond-to(mobile) {
        @include h4;
    }
}

.description {
    @include t1;

    margin-bottom: $space-24;
    color: $text-secondary;
}

.button {
    width: max-content;

    @include respond-to(mobile) {
        width: auto;
    }
}

.cards {
    display: flex;
    gap: $space-16;
    width: 100%;
    margin-top: $space-48;

    @include respond-to(tablet) {
        flex-wrap: wrap;
        margin-top: $space-32;
    }

    @include respond-to(mobile) {
        flex-direction: column;
    }
}

.card {
    display: flex;
    flex: 1;
    gap: $space-12;
    padding: $space-16;
    border: 1px solid $border-subtle;
    border-radius: $radius-8;
    background: $surface-raised;

    @include respond-to(tablet) {
        flex: 1 1 calc(50% - $space-16);
    }

    @include respond-to(mobile) {
        flex: 1 1 100%;
    }
}

.cardIconWrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    min-width: 3.6rem;
    height: 3.6rem;
    border-radius: $radius-8;
    background: $surface-sunken;
    color: $text-link;
}

.cardTitle {
    @include h4;

    margin-bottom: $space-4;
}

.cardDescription {
    @include t2;

    color: $text-secondary;

    @include respond-to(mobile) {
        @include t3;
    }
}
</style>
