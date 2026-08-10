<script setup lang="ts">
import type { ITagItem, TTagsModelValue, TTagValue } from '~/@types/tags';
import { ESize, ETagsLayout } from '~/assets/ts/enums/common';

interface IProps {
    /** Список тегов */
    items: ITagItem[];
    /** Размер тегов */
    size?: ESize;
    /** Раскладка: строкой с переносом или сеткой по две колонки */
    layout?: ETagsLayout;
    /** Разрешает держать выбранными несколько тегов сразу */
    multiple?: boolean;
    /** Отключение всей группы */
    disabled?: boolean;
}

const props = withDefaults(defineProps<IProps>(), {
    size: ESize.Medium,
    layout: ETagsLayout.Row,
    multiple: false,
    disabled: false,
});

const emits = defineEmits<{
    change: [value: TTagsModelValue];
}>();

const model = defineModel<TTagsModelValue>({ default: null });

const style = useCssModule();

const classList = computed(() => [style[`--layout-${props.layout}`]]);

const isBlock = computed(() => props.layout === ETagsLayout.Grid);

const selectedValues = computed<TTagValue[]>(() => {
    if (Array.isArray(model.value)) {
        return model.value;
    }

    return model.value === null ? [] : [model.value];
});

function isSelected(value: TTagValue): boolean {
    return selectedValues.value.includes(value);
}

function getNextValue(item: ITagItem): TTagsModelValue {
    if (!props.multiple) {
        return isSelected(item.value) ? null : item.value;
    }

    return isSelected(item.value)
        ? selectedValues.value.filter(value => value !== item.value)
        : [...selectedValues.value, item.value];
}

function toggle(item: ITagItem): void {
    model.value = getNextValue(item);

    emits('change', model.value);
}
</script>

<template>
    <div :class="[$style.VTags, classList]" class="v-tags">
        <VTag
            v-for="item in props.items"
            :key="item.value"
            :size="props.size"
            :icon="item.icon"
            :counter="item.counter"
            :selected="isSelected(item.value)"
            :block="isBlock"
            :disabled="props.disabled || item.disabled"
            @click="toggle(item)"
        >
            {{ item.label }}
        </VTag>
    </div>
</template>

<style module lang="scss">
.VTags {
    display: flex;

    &.--layout-row {
        flex-wrap: wrap;
        gap: $space-8;
    }

    &.--layout-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: $space-8;

        @include respond-to(mobile) {
            grid-template-columns: 1fr;
        }
    }
}
</style>
