<script setup lang="ts">
interface IProps {
    /** Минимальное значение */
    min?: number;
    /** Максимальное значение */
    max?: number;
    /** Шаг изменения значения */
    step?: number;
    /** Множитель цены следующего шага: больше единицы — слева выводится пометка вида `x2` */
    multiplier?: number;
    /** Отключение обеих кнопок */
    disabled?: boolean;
    /** Только значение: кнопки не выводятся */
    readonly?: boolean;
}

const props = withDefaults(defineProps<IProps>(), {
    min: 0,
    max: Number.POSITIVE_INFINITY,
    step: 1,
    multiplier: 1,
    disabled: false,
    readonly: false,
});

const model = defineModel<number>({ default: 0 });

const ICON_SIZE = 14;

const isDecreaseDisabled = computed(() => props.disabled || model.value <= props.min);

const isIncreaseDisabled = computed(() => props.disabled || model.value >= props.max);

const hasMultiplier = computed(() => props.multiplier > 1);

function decrease() {
    model.value = Math.max(props.min, model.value - props.step);
}

function increase() {
    model.value = Math.min(props.max, model.value + props.step);
}
</script>

<template>
    <div :class="$style.VCounter" class="v-counter">
        <Transition name="fade">
            <div
                v-if="hasMultiplier"
                :class="$style.multiplier"
                class="v-counter__multiplier"
            >
                x <span>{{ multiplier }}</span>
            </div>
        </Transition>

        <button
            v-if="!readonly"
            type="button"
            :disabled="isDecreaseDisabled || undefined"
            :class="$style.control"
            class="v-counter__control"
            aria-label="Уменьшить"
            @click="decrease"
        >
            <VIcon name="minus" :size="ICON_SIZE" />
        </button>

        <span :class="$style.value" class="v-counter__value">
            <VNumber :value="model" />
        </span>

        <button
            v-if="!readonly"
            type="button"
            :disabled="isIncreaseDisabled || undefined"
            :class="$style.control"
            class="v-counter__control"
            aria-label="Увеличить"
            @click="increase"
        >
            <VIcon name="plus" :size="ICON_SIZE" />
        </button>
    </div>
</template>

<style module lang="scss">
.VCounter {
    display: inline-flex;
    gap: $space-4;
    align-items: center;
}

.multiplier {
    @include l4;

    margin-right: $space-2;
    color: $counter-multiplier-text;
    letter-spacing: normal;

    span {
        @include mono3;
    }
}

.control {
    display: flex;
    flex-shrink: 0;
    justify-content: center;
    align-items: center;
    width: $space-20;
    height: $space-20;
    border: 1px solid $counter-btn-border;
    border-radius: $radius-4;
    background-color: $counter-btn-bg;
    color: $counter-btn-icon;
    cursor: pointer;
    transition: all $default-transition;

    @include hover {
        background-color: $counter-btn-bg-hover;
    }

    &:disabled {
        border-color: transparent;
        background-color: $counter-btn-disabled-bg;
        color: $counter-btn-disabled-icon;
        pointer-events: none;
    }
}

.value {
    @include mono2;

    display: flex;
    flex-shrink: 0;
    justify-content: center;
    align-items: center;
    width: $space-20;
    height: $space-20;
    border-radius: $radius-4;
    background-color: $counter-value-bg;
    color: $counter-value-text;
    user-select: none;
}
</style>
