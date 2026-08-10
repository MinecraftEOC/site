<script setup lang="ts">
import { ESize } from '~/assets/ts/enums/common';

interface IProps {
    /** Размер тега */
    size?: ESize;
    /** Иконка слева от подписи */
    icon?: string;
    /** Счётчик справа от подписи */
    counter?: number | null;
    /** Тег выбран: подсвечивается и показывает крестик для снятия */
    selected?: boolean;
    /** Тег занимает всю ширину контейнера, контент прижимается влево */
    block?: boolean;
    /** Отключение тега */
    disabled?: boolean;
}

const props = withDefaults(defineProps<IProps>(), {
    size: ESize.Medium,
    icon: '',
    counter: null,
    selected: false,
    block: false,
    disabled: false,
});

const style = useCssModule();

const classList = computed(() => [
    style[`--size-${props.size}`],
    props.selected ? style._selected : '',
    props.block ? style._block : '',
    props.disabled ? style._disabled : '',
]);

const iconSize = computed(() => props.size === ESize.Small ? 14 : 16);

const removeIconSize = computed(() => props.size === ESize.Small ? 12 : 14);

const hasCounter = computed(() => props.counter !== null);
</script>

<template>
    <button
        type="button"
        :disabled="disabled || undefined"
        :class="[$style.VTag, classList]"
        class="v-tag"
    >
        <VIcon
            v-if="icon"
            :name="icon"
            :size="iconSize"
            :class="$style.icon"
            class="v-tag__icon"
        />

        <span :class="$style.label" class="v-tag__label">
            <slot />
        </span>

        <span
            v-if="hasCounter"
            :class="$style.counter"
            class="v-tag__counter"
        >
            {{ props.counter }}
        </span>

        <span :class="$style.remove" class="v-tag__remove">
            <VIcon
                name="x"
                :size="removeIconSize"
                :class="$style.removeIcon"
            />
        </span>
    </button>
</template>

<style module lang="scss">
.VTag {
    display: inline-flex;
    gap: $space-8;
    justify-content: center;
    align-items: center;
    border: 1px solid $tag-border;
    border-radius: $radius-8;
    background-color: $tag-bg;
    color: $tag-text;
    cursor: pointer;
    user-select: none;
    transition: all $default-transition;

    @include hover {
        background-color: $tag-bg-hover;
    }

    &._selected {
        border-color: $tag-selected-border;
        background-color: $tag-selected-bg;
        color: $tag-selected-text;

        .icon {
            color: $tag-selected-icon;
        }

        .counter {
            color: $tag-selected-counter-text;
        }

        .remove {
            opacity: 1;
        }

        .removeIcon {
            transform: scale(1);
        }
    }

    &._disabled {
        background-color: $tag-disabled-bg;
        color: $tag-disabled-text;
        pointer-events: none;

        .icon,
        .counter {
            color: $tag-disabled-text;
        }
    }

    &.--size-medium {
        @include l2;

        height: $space-32;
        padding: 0 $space-16;

        .remove {
            margin-left: -$space-8;
        }

        &._selected .remove {
            width: rem(14);
            margin-left: 0;
        }
    }

    &.--size-small {
        @include l3;

        gap: $space-4;
        height: $space-24;
        padding: 0 $space-12;

        .remove {
            margin-left: -$space-4;
        }

        &._selected .remove {
            width: rem(12);
            margin-left: 0;
        }
    }

    &._block {
        justify-content: flex-start;
        width: 100%;
        border-radius: $radius-12;

        .remove {
            flex-grow: 1;
            justify-content: flex-end;
        }
    }
}

.icon {
    flex-shrink: 0;
    color: $tag-icon;
    transition: color $default-transition;
}

.label {
    white-space: nowrap;
}

.counter {
    color: $tag-counter-text;
    transition: color $default-transition;
}

.remove {
    display: flex;
    flex-shrink: 0;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    width: 0;
    color: $tag-selected-icon;
    opacity: 0;
    transition: width $default-transition, margin-left $default-transition, opacity $default-transition;
}

.removeIcon {
    flex-shrink: 0;
    transition: transform $default-transition;
    transform: scale(0.6);
}
</style>
