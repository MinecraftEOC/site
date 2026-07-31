<script setup lang="ts">
import { ESize, EStatusColor } from '~/assets/ts/enums/common';

interface IProps {
    /** Цвет индикатора */
    color?: EStatusColor;
    /** Размер бейджа */
    size?: ESize;
    /** Иконка вместо точки-индикатора */
    icon?: string;
}

const props = withDefaults(defineProps<IProps>(), {
    color: EStatusColor.Success,
    size: ESize.Medium,
    icon: '',
});

const style = useCssModule();

const classList = computed(() => [
    style[`--size-${props.size}`],
    style[`--color-${props.color}`],
]);

const iconSize = computed(() => props.size === ESize.Small ? 14 : 16);
</script>

<template>
    <div :class="[$style.VStatusBadge, classList]">
        <VIcon
            v-if="icon"
            :name="icon"
            :size="iconSize"
            :class="$style.icon"
        />

        <span v-else :class="$style.indicator" />

        <slot />
    </div>
</template>

<style module lang="scss">
.VStatusBadge {
    display: inline-flex;
    gap: $space-8;
    justify-content: center;
    align-items: center;
    border: 1px solid $border-inverse;
    border-radius: $radius-full;
    background-color: $overlay-50;
    color: $text-inverse-strong;
    white-space: nowrap;

    &.--size-medium {
        @include l2;

        height: rem(40);
        padding: 0 $space-16;
    }

    &.--size-small {
        @include l3;

        height: $space-32;
        padding: 0 $space-12;
    }

    &.--color-success {
        .indicator {
            background-color: $success;
        }

        .icon {
            color: $success;
        }
    }

    &.--color-warning {
        .indicator {
            background-color: $warning;
        }

        .icon {
            color: $warning;
        }
    }

    &.--color-danger {
        .indicator {
            background-color: $danger;
        }

        .icon {
            color: $danger;
        }
    }
}

.indicator {
    flex-shrink: 0;
    width: $space-8;
    height: $space-8;
    border-radius: $radius-full;
}

.icon {
    flex-shrink: 0;
}
</style>
