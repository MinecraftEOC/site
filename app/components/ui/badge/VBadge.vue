<script setup lang="ts">
import { EBadgeColor, ESize } from '~/assets/ts/enums/common';

interface IProps {
    /** Цветовое состояние бейджа */
    color?: EBadgeColor;
    /** Размер бейджа */
    size?: ESize;
}

const props = withDefaults(defineProps<IProps>(), {
    color: EBadgeColor.Neutral,
    size: ESize.Medium,
});

const style = useCssModule();

const classList = computed(() => [
    style[`--size-${props.size}`],
    style[`--color-${props.color}`],
]);
</script>

<template>
    <div :class="[$style.VBadge, classList]" class="v-badge">
        <slot />
    </div>
</template>

<style module lang="scss">
.VBadge {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    border-radius: $radius-full;
    white-space: nowrap;

    &.--size-medium {
        @include l3;

        height: $space-32;
        padding: 0 $space-16;
    }

    &.--size-small {
        @include l4;

        height: $space-24;
        padding: 0 $space-12;
    }

    &.--color-neutral {
        background-color: $badge-neutral-bg;
        color: $badge-neutral-text;
    }

    &.--color-success {
        background-color: $success-bg;
        color: $success-fg;
    }

    &.--color-warning {
        background-color: $warning-bg;
        color: $warning-fg;
    }

    &.--color-danger {
        background-color: $danger-bg;
        color: $danger-fg;
    }

    &.--color-info {
        background-color: $info-bg;
        color: $info-fg;
    }
}
</style>
