<script setup lang="ts">
import { ESize } from '~/assets/ts/enums/common';

interface IProps {
    /** Размер инпута */
    size?: ESize;
    /** Лейбл */
    label?: string;
    /** Текст ошибки */
    error?: string;
    /** Иконка инпута */
    icon?: string;
    /** Отключение инпута */
    disabled?: boolean;
}

const props = withDefaults(defineProps<IProps>(), {
    size: ESize.Medium,
});

const model = defineModel<string>();

const style = useCssModule();

const classList = computed(() => [
    style[`--size-${props.size}`],
    props.icon ? style._withIcon : '',
    props.error ? style._error : '',
    props.disabled ? style._disabled : '',
]);

const iconSize = computed(() => {
    if (props.size === ESize.Small) {
        return 14;
    }

    return 16;
});
</script>

<template>
    <div :class="[$style.VInput, classList]" class="v-input">
        <span
            v-if="props.label"
            :class="$style.label"
            class="v-input__label"
        >
            {{ props.label }}
        </span>

        <div :class="$style.wrapper">
            <input
                v-model="model"
                v-bind="$attrs"
                :disabled="disabled"
                :class="$style.native"
                class="v-input__native"
            >

            <VIcon
                v-if="props.icon"
                :name="props.icon"
                :size="iconSize"
                :class="$style.icon"
                class="v-input__icon"
            />
        </div>

        <transition name="fade">
            <span v-show="props.error" :class="$style.error">{{ props.error }}</span>
        </transition>
    </div>
</template>

<style module lang="scss">
.VInput {
    position: relative;
    display: flex;
    flex-direction: column;

    &:disabled {
        pointer-events: none;
    }

    &._error {
        .native {
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

        .native {
            background-color: $input-bg-disabled;
        }
    }

    &.--size-small {
        .native {
            height: $space-32;
            padding: $space-2 $space-4;
        }

        &._withIcon {
            .native {
                padding-left: 2.8rem;
            }
        }
    }

    &.--size-medium {
        .native {
            height: $space-40;
            padding: $space-4;
        }

        &._withIcon {
            .native {
                padding-left: $space-32;
            }
        }
    }
}

.label {
    @include l2;

    margin-bottom: $space-8;
}

.wrapper {
    position: relative;
}

.native {
    @include t3;

    border: 1px solid $input-border;
    border-radius: $radius-4;
    background-color: $input-bg;

    &::placeholder {
        color: $input-placeholder;
    }
}

.icon {
    position: absolute;
    top: calc(50% - 0.1rem);
    left: $space-8;
    color: $text-muted;
    transform: translateY(-50%);
}

.error {
    @include t4;

    margin-top: $space-4;
    color: $text-danger;
}
</style>
