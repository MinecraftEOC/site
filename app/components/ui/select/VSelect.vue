<script setup lang="ts" generic="T extends TSelectValue">
import type { ISelectItem, TSelectValue } from '~/@types/select';

import { ESize } from '~/assets/ts/enums/common';

interface IProps {
    /** Список доступных вариантов выбора */
    items: readonly ISelectItem<T>[];
    /** Размер поля выбора */
    size?: ESize;
    /** Заголовок над полем */
    label?: string;
    /** Текст подсказки в тултипе рядом с заголовком */
    hint?: string;
    /** Заглушка, когда выбранное значение не найдено в списке */
    placeholder?: string;
    /** Текст ошибки под полем */
    error?: string;
    /** Иконка слева внутри поля */
    icon?: string;
    /** Отключение выбора */
    disabled?: boolean;
}

const props = withDefaults(defineProps<IProps>(), {
    size: ESize.Medium,
    label: '',
    hint: '',
    placeholder: '',
    error: '',
    icon: '',
    disabled: false,
});

const emits = defineEmits<{
    change: [value: T];
}>();

const model = defineModel<T>({ required: true });

const style = useCssModule();
const rootRef = ref<HTMLElement | null>(null);
const isOpen = ref(false);

const selectedItem = computed<ISelectItem<T> | undefined>(() => {
    return props.items.find(item => item.value === model.value);
});

const displayLabel = computed(() => {
    return selectedItem.value?.label ?? props.placeholder;
});

const classList = computed(() => [
    style[`--size-${props.size}`],
    props.icon ? style._withIcon : '',
    props.error ? style._error : '',
    props.disabled ? style._disabled : '',
    isOpen.value ? style._open : '',
]);

const triggerValueClassList = computed(() => [
    !selectedItem.value ? style._placeholder : '',
]);

const chevronClassList = computed(() => [
    isOpen.value ? style._rotated : '',
]);

const iconSize = computed(() => {
    return props.size === ESize.Small ? 14 : 16;
});

function isSelected(item: ISelectItem<T>): boolean {
    return model.value === item.value;
}

function getOptionClassList(item: ISelectItem<T>) {
    return [
        isSelected(item) ? style._selected : '',
        item.disabled ? style._disabled : '',
    ];
}

function toggleDropdown(): void {
    if (props.disabled) {
        return;
    }

    isOpen.value = !isOpen.value;
}

function closeDropdown(): void {
    isOpen.value = false;
}

function selectOption(item: ISelectItem<T>): void {
    if (props.disabled || item.disabled) {
        return;
    }

    const changed = model.value !== item.value;
    model.value = item.value;
    closeDropdown();

    if (changed) {
        emits('change', item.value);
    }
}

function onDocumentPointerDown(event: MouseEvent): void {
    if (!isOpen.value || !rootRef.value) {
        return;
    }

    const target = event.target as Node | null;
    if (target && !rootRef.value.contains(target)) {
        closeDropdown();
    }
}

function onDocumentKeyDown(event: KeyboardEvent): void {
    if (isOpen.value && event.key === 'Escape') {
        closeDropdown();
    }
}

onMounted(() => {
    document.addEventListener('mousedown', onDocumentPointerDown);
    document.addEventListener('keydown', onDocumentKeyDown);
});

onBeforeUnmount(() => {
    document.removeEventListener('mousedown', onDocumentPointerDown);
    document.removeEventListener('keydown', onDocumentKeyDown);
});
</script>

<template>
    <div
        ref="rootRef"
        :class="[$style.VSelect, classList]"
        class="v-select"
    >
        <span
            v-if="props.label"
            :class="$style.label"
            class="v-select__label"
        >
            {{ props.label }}

            <VTooltip
                v-if="props.hint"
                :text="props.hint"
            >
                <VIcon
                    name="info"
                    :size="12"
                    :class="$style.hintIcon"
                    class="v-select__hint-icon"
                />
            </VTooltip>
        </span>

        <div :class="$style.wrapper">
            <button
                type="button"
                :disabled="props.disabled || undefined"
                :aria-expanded="isOpen"
                aria-haspopup="listbox"
                :class="$style.trigger"
                class="v-select__trigger"
                @click="toggleDropdown"
            >
                <VIcon
                    v-if="props.icon"
                    :name="props.icon"
                    :size="iconSize"
                    :class="$style.icon"
                    class="v-select__icon"
                />

                <span
                    :class="[$style.value, triggerValueClassList]"
                    class="v-select__value"
                >
                    {{ displayLabel }}
                </span>

                <VIcon
                    name="chevron-down"
                    :size="iconSize"
                    :class="[$style.chevron, chevronClassList]"
                    class="v-select__chevron"
                />
            </button>

            <Transition name="fade">
                <div
                    v-if="isOpen"
                    role="listbox"
                    :class="$style.dropdown"
                    class="v-select__dropdown"
                >
                    <button
                        v-for="item in props.items"
                        :key="String(item.value)"
                        type="button"
                        role="option"
                        :disabled="item.disabled || undefined"
                        :aria-selected="isSelected(item)"
                        :class="[$style.option, getOptionClassList(item)]"
                        class="v-select__option"
                        @click="selectOption(item)"
                    >
                        <VIcon
                            v-if="item.icon"
                            :name="item.icon"
                            :size="14"
                            :class="$style.optionIcon"
                        />

                        <span :class="$style.optionLabel">
                            {{ item.label }}
                        </span>

                        <VIcon
                            v-if="isSelected(item)"
                            name="check"
                            :size="14"
                            :class="$style.checkIcon"
                        />
                    </button>
                </div>
            </Transition>
        </div>

        <Transition name="fade">
            <span v-show="props.error" :class="$style.error">{{ props.error }}</span>
        </Transition>
    </div>
</template>

<style module lang="scss">
.VSelect {
    position: relative;
    display: flex;
    flex-direction: column;

    &._error {
        .trigger {
            border-color: $danger;
        }

        .icon {
            color: $danger;
        }
    }

    &._disabled {
        .label {
            color: $text-muted;
        }

        .trigger {
            background-color: $input-bg-disabled;
            color: $text-muted;
            pointer-events: none;
        }
    }

    &._open {
        .trigger {
            border-color: $focus-ring;
        }
    }

    &.--size-small {
        .trigger {
            height: $space-32;
            padding: 0 $space-10;
        }

        &._withIcon {
            .trigger {
                padding-left: $space-28;
            }
        }
    }

    &.--size-medium {
        .trigger {
            height: $space-40;
            padding: 0 $space-12;
        }

        &._withIcon {
            .trigger {
                padding-left: $space-32;
            }
        }
    }
}

.label {
    @include l2;

    display: inline-flex;
    gap: $space-4;
    align-items: center;
    align-self: flex-start;
    margin-bottom: $space-8;
    color: $text-primary;
}

.hintIcon {
    cursor: pointer;
}

.wrapper {
    position: relative;
}

.trigger {
    @include t3;

    display: flex;
    gap: $space-8;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    border: 1px solid $input-border;
    border-radius: $radius-4;
    background-color: $input-bg;
    color: $input-text;
    text-align: left;
    cursor: pointer;
    transition: border-color $default-transition, background-color $default-transition;

    @include hover {
        border-color: $focus-ring;
    }
}

.icon {
    position: absolute;
    top: 50%;
    left: $space-10;
    color: $text-muted;
    transform: translateY(-50%);
}

.value {
    flex: 1;
    overflow: hidden;
    min-width: 0;
    text-overflow: ellipsis;
    white-space: nowrap;

    &._placeholder {
        color: $input-placeholder;
    }
}

.chevron {
    flex-shrink: 0;
    color: $text-muted;
    transition: transform $default-transition, color $default-transition;

    &._rotated {
        color: $text-link;
        transform: rotate(180deg);
    }
}

.dropdown {
    position: absolute;
    top: calc(100% + #{$space-4});
    right: 0;
    left: 0;
    z-index: 30;
    display: flex;
    flex-direction: column;
    gap: $space-2;
    overflow-y: auto;
    max-height: rem(260);
    padding: $space-4;
    border: 1px solid $border;
    border-radius: $radius-8;
    background-color: $surface-raised;
    box-shadow: 0 rem(8) rem(20) $shadow-sheet;
}

.option {
    @include t3;

    display: flex;
    gap: $space-8;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: $space-8 $space-10;
    border-radius: $radius-4;
    color: $text-primary;
    text-align: left;
    cursor: pointer;
    transition: background-color $default-transition, color $default-transition;

    @include hover {
        background-color: $hover-surface;
    }

    &._selected {
        background-color: $tag-selected-bg;
        color: $tag-selected-text;
        font-weight: $fw-medium;
    }

    &._disabled {
        color: $text-muted;
        pointer-events: none;
    }
}

.optionIcon {
    flex-shrink: 0;
    color: $text-secondary;
}

.optionLabel {
    flex: 1;
    overflow: hidden;
    min-width: 0;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.checkIcon {
    flex-shrink: 0;
    color: $tag-selected-icon;
}

.error {
    @include t4;

    margin-top: $space-4;
    color: $danger;
}
</style>
