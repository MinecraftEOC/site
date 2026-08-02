<script setup lang="ts">
import { DialogClose, DialogContent, DialogDescription, DialogOverlay, DialogPortal, DialogRoot, DialogTitle } from 'reka-ui';
import { EModalVariant } from '~/assets/ts/enums/common';

interface IProps {
    /** Заголовок в шапке окна */
    title: string;
    /** Расположение окна на экране */
    variant?: EModalVariant;
    /** Пояснение под заголовком; читается скринридером как описание окна */
    description?: string;
}

const props = withDefaults(defineProps<IProps>(), {
    variant: EModalVariant.Adaptive,
    description: '',
});

const isOpen = defineModel<boolean>({ default: false });

const style = useCssModule();

const classList = computed(() => [style[`--variant-${props.variant}`]]);

const hasHandle = computed(() => props.variant !== EModalVariant.Center);
</script>

<template>
    <DialogRoot v-model:open="isOpen">
        <DialogPortal>
            <DialogOverlay
                :class="$style.overlay"
                class="v-modal__overlay"
            />

            <DialogContent
                :class="[$style.VModal, classList]"
                class="v-modal"
            >
                <span
                    v-if="hasHandle"
                    :class="$style.handle"
                    class="v-modal__handle"
                />

                <div :class="$style.header" class="v-modal__header">
                    <DialogTitle :class="$style.title" class="v-modal__title">
                        {{ title }}
                    </DialogTitle>

                    <DialogClose
                        type="button"
                        aria-label="Закрыть"
                        :class="$style.close"
                        class="v-modal__close"
                    >
                        <VIcon name="x" />
                    </DialogClose>
                </div>

                <DialogDescription
                    v-if="description"
                    :class="$style.description"
                    class="v-modal__description"
                >
                    {{ description }}
                </DialogDescription>

                <div :class="$style.body" class="v-modal__body">
                    <slot />
                </div>
            </DialogContent>
        </DialogPortal>
    </DialogRoot>
</template>

<style module lang="scss">
@mixin close-plate {
    width: $space-32;
    height: $space-32;
    border-radius: $radius-8;
    background-color: $surface-sunken;
    color: $text-secondary;
    font-size: rem(16);

    @include hover {
        background-color: $border-subtle;
    }
}

@mixin close-bare {
    width: $space-24;
    height: $space-24;
    background-color: transparent;
    color: $text-muted;
    font-size: rem(20);

    @include hover {
        color: $text-secondary;
    }
}

@mixin modal-center {
    inset: 0;
    gap: $space-16;
    width: min(#{rem(520)}, calc(100vw - #{$space-32}));
    height: fit-content;
    max-height: calc(100dvh - #{$space-48});
    margin: auto;
    padding: $space-24;
    border: 1px solid $border-subtle;
    border-radius: $radius-12;
    box-shadow: 0 $space-16 $space-32 $shadow-modal;

    &[data-state='open'] {
        animation: v-modal-zoom-in $default-transition;
    }

    &[data-state='closed'] {
        animation: v-modal-zoom-out $default-transition;
    }
}

@mixin modal-bottom-sheet {
    inset: auto 0 0;
    gap: $space-12;
    width: auto;
    max-height: 90dvh;
    margin: 0;
    padding: $space-12 $space-16 $space-16;
    border: 1px solid $border;
    border-radius: $radius-12 $radius-12 0 0;
    box-shadow: 0 (-$space-12) $space-28 $shadow-sheet;

    &[data-state='open'] {
        animation: v-modal-slide-up $default-transition;
    }

    &[data-state='closed'] {
        animation: v-modal-slide-down $default-transition;
    }

    .handle {
        display: block;
    }

    .close {
        @include close-bare;
    }

    .description {
        @include t3;
    }
}

.overlay {
    position: fixed;
    inset: 0;
    z-index: 100;
    background-color: $overlay;

    &[data-state='open'] {
        animation: v-modal-fade-in $default-transition;
    }

    &[data-state='closed'] {
        animation: v-modal-fade-out $default-transition;
    }
}

.VModal {
    position: fixed;
    z-index: 101;
    display: flex;
    flex-direction: column;
    background-color: $surface-raised;

    &.--variant-center {
        @include modal-center;
    }

    &.--variant-bottom-sheet {
        @include modal-bottom-sheet;
    }

    &.--variant-adaptive {
        @include modal-center;

        @include respond-to(mobile) {
            @include modal-bottom-sheet;
        }
    }
}

.handle {
    display: none;
    flex: none;
    align-self: center;
    width: rem(40);
    height: $space-4;
    margin: $space-2 0;
    border-radius: $radius-full;
    background-color: $border;
}

.header {
    display: flex;
    flex: none;
    gap: $space-16;
    justify-content: space-between;
    align-items: center;
}

.title {
    @include h3;

    color: $text-primary;
}

.close {
    @include close-plate;

    display: flex;
    flex: none;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    transition: all $default-transition;
}

.description {
    @include t2;

    flex: none;
    margin: 0;
    color: $text-secondary;
}

.body {
    overflow-y: auto;
    overscroll-behavior: contain;
    min-height: 0;
}

.body:empty {
    display: none;
}

@keyframes v-modal-fade-in {
    from {
        opacity: 0;
    }
}

@keyframes v-modal-fade-out {
    to {
        opacity: 0;
    }
}

@keyframes v-modal-zoom-in {
    from {
        opacity: 0;
        scale: 0.96;
    }
}

@keyframes v-modal-zoom-out {
    to {
        opacity: 0;
        scale: 0.96;
    }
}

@keyframes v-modal-slide-up {
    from {
        translate: 0 100%;
    }
}

@keyframes v-modal-slide-down {
    to {
        translate: 0 100%;
    }
}
</style>
