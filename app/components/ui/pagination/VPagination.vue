<script setup lang="ts">
import { PAGINATION } from '~/assets/ts/constants/content/common';
import { EColor, ESize } from '~/assets/ts/enums/common';

interface IProps {
    /** Whether the previous page is available. */
    canGoPrev?: boolean;
    /** Whether the next page or batch is available. */
    canGoNext: boolean;
    /** Show the previous button; disable for append-only loading. */
    showPrev?: boolean;
    /** Accessible name of the navigation region. */
    label?: string;
    /** Accessible name and tooltip of the previous button. */
    prevLabel?: string;
    /** Accessible name and tooltip of the next button. */
    nextLabel?: string;
    /** Color of the next button, including scan continuation states. */
    nextColor?: EColor;
}

const props = withDefaults(defineProps<IProps>(), {
    canGoPrev: false,
    showPrev: true,
    label: PAGINATION.label,
    prevLabel: PAGINATION.prevLabel,
    nextLabel: PAGINATION.nextLabel,
    nextColor: EColor.Secondary,
});

const emits = defineEmits<{
    prev: [];
    next: [];
}>();

defineSlots<{
    default?: () => unknown;
}>();
</script>

<template>
    <nav
        :class="$style.VPagination"
        :aria-label="props.label"
        class="v-pagination"
    >
        <VButton
            v-if="props.showPrev"
            type="button"
            :class="$style.button"
            :size="ESize.Small"
            :color="EColor.Secondary"
            :disabled="!props.canGoPrev"
            :aria-label="props.prevLabel"
            :title="props.prevLabel"
            icon="chevron-left"
            data-test="pagination-prev"
            @click="emits('prev')"
        />

        <span
            v-if="$slots.default"
            :class="$style.label"
            role="status"
            data-test="pagination-label"
        >
            <slot />
        </span>

        <VButton
            type="button"
            :class="$style.button"
            :size="ESize.Small"
            :color="props.nextColor"
            :disabled="!props.canGoNext"
            :aria-label="props.nextLabel"
            :title="props.nextLabel"
            icon="chevron-right"
            data-test="pagination-next"
            @click="emits('next')"
        />
    </nav>
</template>

<style module lang="scss">
.VPagination {
    display: flex;
    gap: $space-12;
    justify-content: center;
    align-items: center;
    min-width: 0;
    max-width: 100%;

    .button:global(.v-button) {
        flex: none;
        width: $space-32;
        padding: 0;

        :global(.v-button__label) {
            display: none;
        }

        &:focus-visible {
            outline: $space-2 solid $focus-ring;
            outline-offset: $space-2;
        }
    }
}

.label {
    @include l2;

    min-width: 0;
    color: $text-secondary;
    text-align: center;
    overflow-wrap: anywhere;
}
</style>
