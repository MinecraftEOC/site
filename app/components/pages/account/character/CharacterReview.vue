<script setup lang="ts">
import type { CharacterStatus } from '~~/generated/prisma/enums';

import { CHARACTER_STATUS_COLOR, CHARACTER_STATUS_ICON } from '~/assets/ts/constants/character';
import { CHARACTER_REVIEW, CHARACTER_REVIEW_LABEL } from '~/assets/ts/constants/content/account';

interface IProps {
    /** Текст комментария администрации */
    text: string;
    /** Статус персонажа: задаёт цвет плашки, иконку и подпись над текстом */
    status: CharacterStatus;
}

const props = defineProps<IProps>();

const style = useCssModule();

const classList = computed(() => [style[`--color-${CHARACTER_STATUS_COLOR[props.status]}`]]);

const label = computed(() => CHARACTER_REVIEW_LABEL[props.status] ?? '');
</script>

<template>
    <div :class="[$style.CharacterReview, classList]">
        <div :class="$style.iconWrapper">
            <VIcon :name="CHARACTER_STATUS_ICON[status]" :size="18" />
        </div>

        <div :class="$style.content">
            <div :class="$style.title">
                {{ CHARACTER_REVIEW.title }}
            </div>

            <div v-if="label" :class="$style.label">
                {{ label }}
            </div>

            <div :class="$style.text">
                {{ text }}
            </div>
        </div>
    </div>
</template>

<style module lang="scss">
.CharacterReview {
    display: flex;
    gap: $space-12;
    align-items: flex-start;
    padding: $space-16;
    border: 1px solid $border-subtle;
    border-left: rem(4) solid $border;
    border-radius: $radius-12;
    background-color: $surface-raised;

    &.--color-neutral {
        border-left-color: $badge-neutral-bg;
    }

    &.--color-success {
        border-left-color: $success;
        background-color: $success-bg;

        .iconWrapper,
        .title {
            color: $success-fg;
        }
    }

    &.--color-warning {
        border-left-color: $warning;
        background-color: $warning-bg;

        .iconWrapper,
        .title {
            color: $warning-fg;
        }
    }

    &.--color-danger {
        border-left-color: $danger;
        background-color: $danger-bg;

        .iconWrapper,
        .title {
            color: $danger-fg;
        }
    }

    &.--color-info {
        border-left-color: $info;
        background-color: $info-bg;

        .iconWrapper,
        .title {
            color: $info-fg;
        }
    }
}

.iconWrapper {
    display: flex;
    flex-shrink: 0;
    justify-content: center;
    align-items: center;
    width: rem(36);
    height: rem(36);
    border-radius: $radius-8;
    background-color: $surface-raised;
}

.content {
    display: flex;
    flex-direction: column;
    gap: $space-4;
}

.title {
    @include h4;
}

.label {
    @include l4;

    color: $text-muted;
    text-transform: uppercase;
}

.text {
    @include t4;

    color: $text-secondary;
}
</style>
