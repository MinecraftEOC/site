<script setup lang="ts">
import type { ICharacter } from '~~/shared/@types/user';

import { CharacterStatus } from '~~/generated/prisma/enums';
import { isCharacterLive } from '~~/shared/constants/character';
import { CHARACTER_CREATED_AT_STATUSES, CHARACTER_STATUS_COLOR } from '~/assets/ts/constants/character';
import {
    CHARACTER_STATUS_DATE_LABEL,
    CHARACTER_STATUS_DESCRIPTION,
    CHARACTER_STATUS_LABEL,
    CHARACTERS_LIST,
    DEFAULT_TITLE,
} from '~/assets/ts/constants/content/account';
import { ACCOUNT_ROUTES } from '~/assets/ts/constants/routes';
import { EColor, ESize, ETag } from '~/assets/ts/enums/common';

import AccountPageTemplate from '~/components/pages/account/AccountPageTemplate.vue';

const userStore = useUserStore();

const style = useCssModule();

const showCreateButton = computed(() => !userStore.hasLiveCharacter || userStore.isAdmin);

const characters = computed(() => [...userStore.characters].sort((a, b) => {
    const weight = getSortWeight(a) - getSortWeight(b);

    if (weight !== 0) {
        return weight;
    }

    return new Date(b.statusChangedAt).getTime() - new Date(a.statusChangedAt).getTime();
}));

function getSortWeight(character: ICharacter) {
    if (character.status === CharacterStatus.ACTIVE) {
        return 0;
    }

    return isCharacterLive(character.status) ? 1 : 2;
}

function isWide(index: number) {
    return index === 0 && characters.value.length !== 2;
}

function getCardClassList(character: ICharacter, index: number) {
    return [
        style[`--color-${CHARACTER_STATUS_COLOR[character.status]}`],
        isWide(index) ? style._wide : '',
    ];
}

function getDescription(character: ICharacter) {
    return CHARACTER_STATUS_DESCRIPTION[character.status] ?? character.statusComment ?? '';
}

function getDate(character: ICharacter) {
    const date = CHARACTER_CREATED_AT_STATUSES.includes(character.status)
        ? character.createdAt
        : character.statusChangedAt;

    return `${CHARACTER_STATUS_DATE_LABEL[character.status]}: ${formatDate(date)}`;
}
</script>

<template>
    <AccountPageTemplate
        :title="DEFAULT_TITLE"
        :description="CHARACTERS_LIST.description"
        :class="$style.CharactersList"
    >
        <template #header-right>
            <VButton
                v-if="showCreateButton"
                :tag="ETag.NuxtLink"
                :to="ACCOUNT_ROUTES.characterCreate"
            >
                {{ CHARACTERS_LIST.button }}
            </VButton>
        </template>

        <div :class="$style.list">
            <div
                v-for="(character, index) in characters"
                :key="character.id"
                :class="[$style.card, getCardClassList(character, index)]"
            >
                <div :class="$style.info">
                    <div :class="$style.name">
                        {{ character.username }}
                    </div>

                    <div v-if="getDescription(character)" :class="$style.description">
                        {{ getDescription(character) }}
                    </div>

                    <div :class="$style.date">
                        {{ getDate(character) }}
                    </div>
                </div>

                <div :class="$style.aside">
                    <VBadge :color="CHARACTER_STATUS_COLOR[character.status]" :size="ESize.Small">
                        {{ CHARACTER_STATUS_LABEL[character.status] }}
                    </VBadge>

                    <VButton
                        :tag="ETag.NuxtLink"
                        :to="ACCOUNT_ROUTES.character(character.id)"
                        :color="EColor.Secondary"
                        :size="ESize.Small"
                    >
                        {{ CHARACTERS_LIST.cardButton }}
                    </VButton>
                </div>
            </div>
        </div>
    </AccountPageTemplate>
</template>

<style module lang="scss">
.CharactersList {
    //
}

.list {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: $space-16;

    @include respond-to(mobile) {
        grid-template-columns: minmax(0, 1fr);
        gap: $space-12;
    }
}

.card {
    display: flex;
    gap: $space-16;
    justify-content: space-between;
    align-items: flex-start;
    padding: $space-16 $space-16 $space-16 $space-12;
    border: 1px solid $border-subtle;
    border-left: rem(4) solid $border;
    border-radius: $radius-12;
    background-color: $surface-raised;

    &._wide {
        grid-column: 1 / -1;
    }

    &.--color-neutral {
        border-left-color: $badge-neutral-bg;
    }

    &.--color-success {
        border-left-color: $success;
    }

    &.--color-warning {
        border-left-color: $warning;
    }

    &.--color-danger {
        border-left-color: $danger;
    }

    &.--color-info {
        border-left-color: $info;
    }
}

.info {
    display: flex;
    flex-direction: column;
    gap: $space-8;
}

.name {
    @include h4;
}

.description {
    @include t3;

    color: $text-secondary;
}

.date {
    @include mono2;

    color: $text-muted;
}

.aside {
    display: flex;
    flex-shrink: 0;
    flex-direction: column;
    gap: $space-12;
    align-items: flex-end;
}
</style>
