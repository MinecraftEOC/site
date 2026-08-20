<script setup lang="ts" generic="T extends TSwitcherValue">
import type { ISwitcherItem, TSwitcherValue } from '~/@types/switcher';

import { ESize } from '~/assets/ts/enums/common';

interface IProps {
    /** Варианты переключателя: выбран всегда ровно один */
    items: ISwitcherItem<T>[];
    /** Размер переключателя */
    size?: ESize;
    /** Отключение всего переключателя */
    disabled?: boolean;
}

const props = withDefaults(defineProps<IProps>(), {
    size: ESize.Medium,
    disabled: false,
});

const emits = defineEmits<{
    change: [value: T];
}>();

const model = defineModel<T>({ required: true });

const style = useCssModule();

const classList = computed(() => [
    style[`--size-${props.size}`],
    props.disabled ? style._disabled : '',
]);

const iconSize = computed(() => props.size === ESize.Small ? 14 : 16);

function isActive(item: ISwitcherItem<T>): boolean {
    return model.value === item.value;
}

function getItemClassList(item: ISwitcherItem<T>) {
    return [
        isActive(item) ? style._active : '',
        item.disabled ? style._disabled : '',
    ];
}

function hasCounter(item: ISwitcherItem<T>): boolean {
    return item.counter !== null && item.counter !== undefined;
}

// Повторный клик по активному варианту ничего не делает: у переключателя нет
// состояния «ничего не выбрано»
function select(item: ISwitcherItem<T>) {
    if (isActive(item)) {
        return;
    }

    model.value = item.value;

    emits('change', item.value);
}
</script>

<template>
    <div
        role="group"
        :class="[$style.VSwitcher, classList]"
        class="v-switcher"
    >
        <button
            v-for="item in props.items"
            :key="item.value"
            type="button"
            :disabled="props.disabled || item.disabled || undefined"
            :aria-pressed="isActive(item)"
            :class="[$style.item, getItemClassList(item)]"
            class="v-switcher__item"
            @click="select(item)"
        >
            <VIcon
                v-if="item.icon"
                :name="item.icon"
                :size="iconSize"
                :class="$style.icon"
                class="v-switcher__icon"
            />

            <span :class="$style.label" class="v-switcher__label">
                {{ item.label }}
            </span>

            <span
                v-if="hasCounter(item)"
                :class="$style.counter"
                class="v-switcher__counter"
            >
                {{ item.counter }}
            </span>
        </button>
    </div>
</template>

<style module lang="scss">
.VSwitcher {
    display: inline-flex;
    gap: $space-4;
    align-items: center;
    max-width: 100%;
    padding: $space-4;
    border: 1px solid $switcher-border;
    border-radius: $radius-12;
    background-color: $switcher-bg;

    &.--size-medium {
        .item {
            @include l2;

            height: $space-32;
            padding: 0 $space-16;
        }
    }

    &.--size-small {
        .item {
            @include l3;

            gap: $space-4;
            height: $space-24;
            padding: 0 $space-12;
        }
    }

    &._disabled {
        .item {
            color: $switcher-disabled-text;
            pointer-events: none;
        }

        .icon,
        .counter {
            color: $switcher-disabled-text;
        }
    }
}

.item {
    display: inline-flex;
    gap: $space-8;
    justify-content: center;
    align-items: center;
    min-width: 0;
    border: 1px solid $transparent;
    border-radius: $radius-8;
    color: $switcher-text;
    cursor: pointer;
    user-select: none;
    transition: all $default-transition;

    @include hover {
        color: $switcher-active-text;
    }

    &._active {
        border-color: $switcher-active-border;
        background-color: $switcher-active-bg;
        color: $switcher-active-text;
        cursor: default;

        .icon {
            color: $switcher-active-icon;
        }
    }

    &._disabled {
        color: $switcher-disabled-text;
        pointer-events: none;
    }
}

.icon {
    flex-shrink: 0;
    color: $switcher-icon;
    transition: color $default-transition;
}

.label {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.counter {
    color: $switcher-counter-text;
    transition: color $default-transition;
}
</style>
