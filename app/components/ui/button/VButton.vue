<script setup lang="ts">
import { EColor, ESize, ETag } from '~/assets/ts/enums/common';

interface IProps {
    /** Тег кнопки. */
    tag?: ETag;
    /** Размер кнопки. */
    size?: ESize;
    /** Цветовая схема кнопки. */
    color?: EColor;
    /** Иконка кнопки. */
    icon?: string;
    /** Отключение кнопки. */
    disabled?: boolean;
}

const props = withDefaults(defineProps<IProps>(), {
    tag: ETag.Button,
    size: ESize.Medium,
    color: EColor.Primary,
    icon: '',
    disabled: false,
});

const style = useCssModule();

const classList = computed(() => [
    style[`--size-${props.size}`],
    style[`--color-${props.color}`],
    props.disabled ? style['--disabled'] : '',
]);

const iconSize = computed(() => {
    if (props.size === ESize.Small) {
        return 14;
    }

    return 16;
});
</script>

<template>
    <component
        :is="props.tag"
        v-bind="$attrs"
        :class="[$style.VButton, classList]"
        class="v-button"
    >
        <VIcon
            v-if="icon"
            :name="icon"
            :size="iconSize"
        />

        <span class="v-button__label">
            <slot />
        </span>
    </component>
</template>

<style module lang="scss">
.VButton {
    @include l2;

    display: flex;
    gap: $space-8;
    justify-content: center;
    align-items: center;
    border-radius: $radius-8;
    cursor: pointer;
    user-select: none;
    transition: all $default-transition;

    &:disabled, &.--disabled {
        pointer-events: none;
    }

    &.--size-small {
        height: rem(32);
        padding: $space-8 $space-12;
    }

    &.--size-medium {
        height: rem(40);
        padding: $space-8 $space-16;
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

        &:disabled,
        &.--disabled {
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

        &:disabled,
        &.--disabled {
            background-color: $btn-secondary-disabled-bg;
            color: $btn-secondary-disabled-text;
        }
    }

    &.--color-secondary-dark {
        border: 1px solid $btn-secondary-dark-border;
        background-color: $btn-secondary-dark-bg;
        color: $btn-secondary-dark-text;

        &:hover {
            opacity: 0.8;
        }

        &:disabled,
        &.--disabled {
            background-color: $btn-secondary-dark-disabled-bg;
            color: $btn-secondary-dark-disabled-text;
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

        &:disabled,
        &.--disabled {
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

        &:disabled,
        &.--disabled {
            background-color: $btn-danger-disabled-bg;
            color: $btn-danger-disabled-text;
        }
    }
}
</style>
