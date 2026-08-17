<script setup lang="ts">
import { DOWNLOAD_CARDS, DOWNLOAD_PAGE } from '~/assets/ts/constants/content/download';
import { ETag } from '~/assets/ts/enums/common';
</script>

<template>
    <div :class="$style.DownloadPlatforms">
        <div :class="$style.cards">
            <div
                v-for="card in DOWNLOAD_CARDS"
                :key="card.platform"
                :class="$style.card"
            >
                <div :class="$style.cardHeader">
                    <div :class="$style.cardIconWrapper">
                        <VIcon :name="card.icon" :size="20" />
                    </div>

                    <div :class="$style.cardTitle">
                        {{ card.title }}
                    </div>
                </div>

                <VButton
                    :tag="ETag.Link"
                    :href="card.link"
                    :class="$style.cardButton"
                    icon="download"
                    target="_blank"
                    rel="noopener"
                >
                    {{ card.button }}
                </VButton>
            </div>
        </div>

        <div :class="$style.note">
            <VIcon name="info" :size="16" />

            <span>{{ DOWNLOAD_PAGE.note }}</span>
        </div>
    </div>
</template>

<style module lang="scss">
.DownloadPlatforms {
    display: flex;
    flex-direction: column;
    gap: $space-16;
    width: 100%;
}

.cards {
    display: flex;
    gap: $space-24;

    @include respond-to(laptop) {
        gap: $space-16;
    }

    @include respond-to(mobile) {
        flex-direction: column;
    }
}

.card {
    display: flex;
    flex: 1;
    gap: $space-16;
    justify-content: space-between;
    align-items: center;
    padding: $space-20 $space-24;
    border: 1px solid $border-subtle;
    border-radius: $radius-12;
    background-color: $surface-raised;
    transition: border-color $default-transition;

    @include hover {
        border-color: $border-focus;
    }

    @include respond-to(mobile) {
        padding: $space-16;
    }
}

.cardHeader {
    display: flex;
    gap: $space-12;
    align-items: center;
    min-width: 0;
}

.cardIconWrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    min-width: $space-40;
    height: $space-40;
    border-radius: $radius-8;
    background-color: $surface-sunken;
    color: $text-link;
}

.cardTitle {
    @include h4;
}

.cardButton {
    flex-shrink: 0;
}

.note {
    @include t4;

    display: flex;
    gap: $space-8;
    align-items: center;
    color: $text-muted;
}
</style>
