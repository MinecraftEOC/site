<script setup lang="ts">
interface IProps {
    /** Лейбл над чекбоксом */
    label?: string;
    /** Текст ошибки */
    error?: string;
    /** Отключение чекбокса */
    disabled?: boolean;
}

const props = defineProps<IProps>();

const model = defineModel<boolean>();

const style = useCssModule();

const classList = computed(() => [
    props.error ? style._error : '',
    props.disabled ? style._disabled : '',
    model.value ? style._checked : '',
]);
</script>

<template>
    <div :class="[$style.VCheckbox, classList]" class="v-checkbox">
        <span
            v-if="props.label"
            :class="$style.label"
            class="v-checkbox__label"
        >
            {{ props.label }}
        </span>

        <label :class="$style.control" class="v-checkbox__control">
            <input
                v-model="model"
                v-bind="$attrs"
                type="checkbox"
                :disabled="disabled"
                :class="$style.native"
                class="v-checkbox__native"
            >

            <span :class="$style.box" class="v-checkbox__box">
                <VIcon
                    v-show="model"
                    name="check"
                    :size="14"
                    :class="$style.icon"
                    class="v-checkbox__icon"
                />
            </span>

            <span :class="$style.text" class="v-checkbox__text"><slot /></span>
        </label>

        <transition name="fade">
            <span v-show="props.error" :class="$style.error">{{ props.error }}</span>
        </transition>
    </div>
</template>

<style module lang="scss">
.VCheckbox {
    display: flex;
    flex-direction: column;

    &._error {
        .box {
            border-color: $danger;
        }
    }

    &._checked {
        .box {
            border-color: $control-active;
            background-color: $control-active;
        }
    }

    &._disabled {
        pointer-events: none;

        .label,
        .text {
            color: $text-muted;
        }

        .box {
            background-color: $input-bg-disabled;
        }
    }
}

.label {
    @include l2;

    margin-bottom: $space-8;
}

.control {
    display: flex;
    gap: $space-8;
    align-items: center;
    cursor: pointer;
}

.native {
    position: absolute;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    width: 1px;
    height: 1px;
    white-space: nowrap;
}

.box {
    display: flex;
    flex-shrink: 0;
    justify-content: center;
    align-items: center;
    width: $space-20;
    height: $space-20;
    border: 1px solid $input-border;
    border-radius: $radius-4;
    background-color: $input-bg;
    transition: background-color 0.15s ease, border-color 0.15s ease;
}

.icon {
    color: $cream;
}

.text {
    @include t3;
}

.error {
    @include t4;

    margin-top: $space-4;
    color: $text-danger;
}
</style>
