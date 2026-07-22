<script setup lang="ts">
import { EColor, ESize } from '~/assets/ts/enums/common';

interface IProps {
    /** Размер кнопки. */
    size?: ESize;
    /** Цветовая схема кнопки. */
    color?: EColor;
    /** Иконка кнопки. */
    icon?: string;
}

const props = withDefaults(defineProps<IProps>(), {
    size: ESize.Medium,
    color: EColor.Primary,
});

const style = useCssModule();

const classList = computed(() => [
    style[`--size-${props.size}`],
    style[`--color-${props.color}`],
]);

const iconSize = computed(() => {
    if (props.size === ESize.Small) {
        return 14;
    }

    return 16;
});
</script>

<template>
    <button v-bind="$attrs" :class="[$style.VButton, classList]">
        <VIcon v-if="icon" :name="icon" :size="iconSize" />

        <slot />
    </button>
</template>

<style module lang="scss">
.VButton {
    @include l2;

    display: flex;
    gap: 8px;
    align-items: center;
    border-radius: 8px;
    user-select: none;

    &:disabled {
        pointer-events: none;
    }

    &.--size-small {
        height: 32px;
        padding: 8px 12px;
    }

    &.--size-medium {
        height: 40px;
        padding: 8px 16px;
    }

    &.--color-primary {
        background-color: $btn-primary-bg;
        color: $btn-primary-text;

        &:hover {
            background-color: $btn-primary-bg-hover;
        }

        &:active {
            background-color: $btn-primary-bg-active;
        }

        &:disabled {
            background-color: $btn-primary-disabled-bg;
            color: $btn-primary-disabled-text;
        }
    }

    &.--color-secondary {
        border: 1px solid $btn-secondary-border;
        background-color: $btn-secondary-bg;
        color: $btn-secondary-text;

        &:hover {
            background-color: $btn-secondary-bg-hover;
        }

        &:active {
            background-color: $btn-secondary-bg-active;
        }

        &:disabled {
            background-color: $btn-secondary-disabled-bg;
            color: $btn-secondary-disabled-text;
        }
    }

    &.--color-accent {
        background-color: $btn-accent-bg;
        color: $btn-accent-text;

        &:hover {
            background-color: $btn-accent-bg-hover;
        }

        &:active {
            background-color: $btn-accent-bg-active;
        }

        &:disabled {
            background-color: $btn-accent-disabled-bg;
            color: $btn-accent-disabled-text;
        }
    }

    &.--color-danger {
        background-color: $btn-danger-bg;
        color: $btn-danger-text;

        &:hover {
            background-color: $btn-danger-bg-hover;
        }

        &:active {
            background-color: $btn-danger-bg-active;
        }

        &:disabled {
            background-color: $btn-danger-disabled-bg;
            color: $btn-danger-disabled-text;
        }
    }
}
</style>
