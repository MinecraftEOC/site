<script setup lang="ts">
import type { Placement } from '@floating-ui/vue';
import { arrow, autoUpdate, flip, offset, shift, useFloating } from '@floating-ui/vue';

interface IProps {
    /** Текст тултипа; для сложного содержимого используется слот `content` */
    text?: string;
    /** Предпочитаемая сторона появления — при нехватке места меняется автоматически */
    placement?: Placement;
    /** Задержка перед показом, мс */
    delay?: number;
    /** Отключает показ: триггер работает как обычно, тултип не появляется */
    disabled?: boolean;
    /** Разрешает навести курсор на саму подсказку */
    interactive?: boolean;
}

const props = withDefaults(defineProps<IProps>(), {
    text: '',
    placement: 'top',
    delay: 150,
    disabled: false,
    interactive: false,
});

const TOOLTIP_OFFSET = 8;
const VIEWPORT_PADDING = 8;
const CLOSE_DELAY = 120;

const slots = useSlots();

const reference = useTemplateRef<HTMLElement>('reference');
const floating = useTemplateRef<HTMLElement>('floating');
const floatingArrow = useTemplateRef<HTMLElement>('floatingArrow');

const id = useId();
const isOpen = ref(false);

let openTimer: ReturnType<typeof setTimeout> | undefined;
let closeTimer: ReturnType<typeof setTimeout> | undefined;

const { floatingStyles, placement: currentPlacement, middlewareData } = useFloating(reference, floating, {
    open: isOpen,
    placement: () => props.placement,
    whileElementsMounted: autoUpdate,
    middleware: [
        offset(TOOLTIP_OFFSET),
        flip({ padding: VIEWPORT_PADDING }),
        shift({ padding: VIEWPORT_PADDING }),
        arrow({ element: floatingArrow }),
    ],
});

const hasContent = computed(() => Boolean(props.text) || Boolean(slots.content));
const arrowStyles = computed(() => {
    const { x, y } = middlewareData.value.arrow ?? {};

    return {
        left: x === undefined ? '' : `${x}px`,
        top: y === undefined ? '' : `${y}px`,
    };
});

function stopTimers() {
    clearTimeout(openTimer);
    clearTimeout(closeTimer);
}

function open() {
    clearTimeout(closeTimer);

    if (props.disabled || !hasContent.value || isOpen.value) {
        return;
    }

    openTimer = setTimeout(() => {
        isOpen.value = true;
    }, props.delay);
}

function close() {
    clearTimeout(openTimer);

    if (props.interactive) {
        closeTimer = setTimeout(() => {
            isOpen.value = false;
        }, CLOSE_DELAY);

        return;
    }

    isOpen.value = false;
}

function onFloatingEnter() {
    if (props.interactive) {
        clearTimeout(closeTimer);
    }
}

function onFloatingLeave() {
    if (props.interactive) {
        close();
    }
}

onBeforeUnmount(stopTimers);
</script>

<template>
    <span
        ref="reference"
        :class="$style.VTooltip"
        :aria-describedby="isOpen ? id : undefined"
        @mouseenter="open"
        @mouseleave="close"
        @focusin="open"
        @focusout="close"
        @keydown.escape="close"
    >
        <slot />

        <Teleport to="body">
            <Transition name="fade">
                <div
                    v-if="isOpen"
                    :id="id"
                    ref="floating"
                    role="tooltip"
                    :class="[$style.tooltip, props.interactive ? $style._interactive : '']"
                    :style="floatingStyles"
                    :data-placement="currentPlacement"
                    @mouseenter="onFloatingEnter"
                    @mouseleave="onFloatingLeave"
                >
                    <slot name="content">
                        {{ props.text }}
                    </slot>

                    <span
                        ref="floatingArrow"
                        :class="$style.arrow"
                        :style="arrowStyles"
                    />
                </div>
            </Transition>
        </Teleport>
    </span>
</template>

<style module lang="scss">
.VTooltip {
    display: inline-flex;
}

.tooltip {
    @include t4;

    z-index: 10;
    width: max-content;
    max-width: 24rem;
    padding: $space-8 $space-12;
    border-radius: $radius-8;
    background-color: $surface-dark;
    color: $text-inverse;
    pointer-events: none;

    &._interactive {
        pointer-events: auto;
    }
}

.arrow {
    position: absolute;
    width: $space-8;
    height: $space-8;
    background-color: $surface-dark;
    transform: rotate(45deg);
}

.tooltip[data-placement^='top'] .arrow {
    bottom: -$space-4;
}

.tooltip[data-placement^='bottom'] .arrow {
    top: -$space-4;
}

.tooltip[data-placement^='left'] .arrow {
    right: -$space-4;
}

.tooltip[data-placement^='right'] .arrow {
    left: -$space-4;
}
</style>
