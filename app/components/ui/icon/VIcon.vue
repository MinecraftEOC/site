<script setup lang="ts">
const props = defineProps<{
    /** Имя иконки (без префикса — из набора lucide, либо с префиксом `набор:имя`). */
    name: string;
    /** Размер иконки (CSS-значение). По умолчанию наследуется от `font-size`. */
    size?: string | number;
}>();

const DEFAULT_COLLECTION = 'lucide';

const iconName = computed(() => props.name.includes(':') ? props.name : `${DEFAULT_COLLECTION}:${props.name}`);
</script>

<template>
    <Icon :name="iconName" :size="size" />
</template>
