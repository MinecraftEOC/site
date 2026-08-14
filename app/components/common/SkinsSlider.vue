<script setup lang="ts">
import type { Swiper as TSwiper } from 'swiper';
import type { ISkinHashItem, TSkinItem } from '~/@types/skin';

import { Swiper, SwiperSlide } from 'swiper/vue';

import {
    SKIN_NEW_LABEL,
    SKINS_SLIDER_BREAKPOINTS,
    SKINS_SLIDER_SPACE_BETWEEN,
} from '~/assets/ts/constants/skin';
import { EBadgeColor, ESize } from '~/assets/ts/enums/common';

import 'swiper/css';

interface IProps {
    /** Смешанный список превью: файлы из инпута и уже сохранённые скины по хэшу */
    items: TSkinItem[];
    /** Заголовок над слайдером */
    title?: string;
    /** Только просмотр: кнопка удаления не выводится */
    readonly?: boolean;
}

const props = withDefaults(defineProps<IProps>(), {
    title: '',
    readonly: false,
});

const emits = defineEmits<{
    removeFile: [file: File];
    removeHash: [skin: ISkinHashItem];
}>();

const style = useCssModule();

let swiper: TSwiper | undefined;

const isBeginning = ref(true);
const isEnd = ref(true);

const hasNav = computed(() => !isBeginning.value || !isEnd.value);

const prevButtonClassList = computed(() => [isBeginning.value ? style._disabled : '']);

const nextButtonClassList = computed(() => [isEnd.value ? style._disabled : '']);

function syncEdges(instance: TSwiper) {
    isBeginning.value = instance.isBeginning;
    isEnd.value = instance.isEnd;
}

function onSwiper(instance: TSwiper) {
    swiper = instance;

    syncEdges(instance);
}

function prev() {
    swiper?.slidePrev();
}

function next() {
    swiper?.slideNext();
}

function remove(item: TSkinItem) {
    if (isSkinFileItem(item)) {
        emits('removeFile', item.file);

        return;
    }

    emits('removeHash', item);
}

onBeforeUnmount(() => {
    swiper = undefined;
});
</script>

<template>
    <div :class="$style.SkinsSlider">
        <div :class="$style.header">
            <h3 v-if="props.title" :class="$style.title">
                {{ props.title }}
            </h3>

            <div v-if="hasNav" :class="$style.nav">
                <button
                    type="button"
                    :class="[$style.navButton, prevButtonClassList]"
                    @click="prev"
                >
                    <VIcon name="chevron-left" />
                </button>

                <button
                    type="button"
                    :class="[$style.navButton, nextButtonClassList]"
                    @click="next"
                >
                    <VIcon name="chevron-right" />
                </button>
            </div>
        </div>

        <Swiper
            :space-between="SKINS_SLIDER_SPACE_BETWEEN"
            :breakpoints="SKINS_SLIDER_BREAKPOINTS"
            :simulate-touch="false"
            @swiper="onSwiper"
            @slide-change="syncEdges"
            @resize="syncEdges"
            @update="syncEdges"
        >
            <SwiperSlide
                v-for="(item, index) in props.items"
                :key="getSkinKey(item)"
            >
                <div :class="$style.preview">
                    <VBadge
                        v-if="isSkinFileItem(item)"
                        :size="ESize.Small"
                        :color="EBadgeColor.Info"
                        :class="$style.badge"
                    >
                        {{ SKIN_NEW_LABEL }}
                    </VBadge>

                    <button
                        v-if="!props.readonly"
                        type="button"
                        :title="getSkinLabel(item, index)"
                        :class="$style.remove"
                        @click="remove(item)"
                    >
                        <VIcon name="x" :size="14" />
                    </button>

                    <VSkin
                        :file="getSkinFile(item)"
                        :hash="getSkinHash(item)"
                        :label="getSkinLabel(item, index)"
                    />
                </div>
            </SwiperSlide>
        </Swiper>
    </div>
</template>

<style module lang="scss">
.SkinsSlider {
    contain: inline-size;
    overflow: hidden;
}

.header {
    display: flex;
    gap: $space-12;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $space-12;
}

.title {
    @include h4;
}

.nav {
    display: flex;
    gap: $space-8;
}

.navButton {
    display: flex;
    flex-shrink: 0;
    justify-content: center;
    align-items: center;
    width: $space-32;
    height: $space-32;
    border: 1px solid $border-subtle;
    border-radius: 50%;
    background-color: $surface-raised;
    color: $text-link;
    cursor: pointer;
    transition: all $default-transition;

    @include hover {
        background-color: $hover-surface;
    }

    &._disabled {
        border-color: $border-subtle;
        background-color: transparent;
        color: $text-muted;
        pointer-events: none;
    }
}

.preview {
    position: relative;
    overflow: hidden;
    aspect-ratio: 2 / 3;
    border-radius: $radius-8;
    background-color: $surface-sunken;
}

.badge {
    position: absolute;
    top: $space-8;
    left: $space-8;
    z-index: 1;
}

.remove {
    position: absolute;
    top: $space-8;
    right: $space-8;
    z-index: 1;
    display: flex;
    flex-shrink: 0;
    justify-content: center;
    align-items: center;
    width: $space-28;
    height: $space-28;
    border-radius: 50%;
    background-color: $danger-bg;
    color: $text-danger;
    cursor: pointer;
    transition: all $default-transition;

    @include hover {
        background-color: $danger;
        color: $text-inverse;
    }
}
</style>
