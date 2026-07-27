<script setup lang="ts">
interface IProps {
    /** Имя иконки (без префикса — из набора lucide, либо с префиксом `набор:имя`). */
    name: string;
    /**
     * Размер иконки. Числом — в px по макету 1440px (20 → 2rem), строкой —
     * готовое CSS-значение. По умолчанию наследуется от `font-size`.
     */
    size?: string | number;
}

const props = defineProps<IProps>();

const DEFAULT_COLLECTION = 'lucide';

const iconName = computed(() => props.name.includes(':') ? props.name : `${DEFAULT_COLLECTION}:${props.name}`);

const iconSize = computed(() => typeof props.size === 'number' ? rem(props.size) : props.size);
</script>

<template>
    <Icon :name="iconName" :size="iconSize" />
</template>
