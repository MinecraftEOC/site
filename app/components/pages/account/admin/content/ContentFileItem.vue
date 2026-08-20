<script setup lang="ts">
import { CONTENT_FORM } from '~/assets/ts/constants/content/account';

interface IProps {
    /** Адрес превью: сохранённый файл или выбранный в инпуте */
    preview: string;
    /** Подпись строки — имя файла */
    name: string;
    /** Показывать кнопку копирования markdown-разметки картинки */
    copyable?: boolean;
    /** Показывать кнопку удаления файла */
    removable?: boolean;
}

const props = withDefaults(defineProps<IProps>(), {
    copyable: false,
    removable: false,
});

const emits = defineEmits<{
    copy: [];
    remove: [];
}>();

const ACTION_ICON_SIZE = 14;
</script>

<template>
    <div :class="$style.ContentFileItem">
        <img
            :src="props.preview"
            :alt="props.name"
            loading="lazy"
            :class="$style.preview"
        >

        <span :class="$style.name">{{ props.name }}</span>

        <button
            v-if="props.copyable"
            type="button"
            :title="CONTENT_FORM.gallery.copy"
            :aria-label="CONTENT_FORM.gallery.copy"
            :class="$style.action"
            @click="emits('copy')"
        >
            <VIcon name="copy" :size="ACTION_ICON_SIZE" />
        </button>

        <button
            v-if="props.removable"
            type="button"
            :title="CONTENT_FORM.gallery.remove"
            :aria-label="CONTENT_FORM.gallery.remove"
            :class="[$style.action, $style._danger]"
            @click="emits('remove')"
        >
            <VIcon name="x" :size="ACTION_ICON_SIZE" />
        </button>
    </div>
</template>

<style module lang="scss">
.ContentFileItem {
    display: flex;
    gap: $space-12;
    align-items: center;
    padding: $space-8 $space-12;
    border: 1px solid $border-subtle;
    border-radius: $radius-8;
    background-color: $surface-raised;
}

.preview {
    flex-shrink: 0;
    object-fit: cover;
    width: rem(48);
    height: rem(32);
    border-radius: $radius-4;
    background-color: $surface-sunken;
}

.name {
    @include mono2;

    flex: 1;
    overflow: hidden;
    color: $text-secondary;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.action {
    display: flex;
    flex-shrink: 0;
    justify-content: center;
    align-items: center;
    width: rem(28);
    height: rem(28);
    border: 1px solid $border-subtle;
    border-radius: $radius-8;
    background-color: $surface-raised;
    color: $text-secondary;
    transition: all $default-transition;

    @include hover {
        border-color: $border-focus;
        color: $text-primary;
    }

    &._danger {
        @include hover {
            border-color: $danger;
            color: $danger;
        }
    }
}
</style>
