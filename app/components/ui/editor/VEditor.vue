<script setup lang="ts">
import { EDITOR_DEFAULT_TOOLBAR, EDITOR_EMPTY_HTML } from '~/assets/ts/constants/editor';

import '@vueup/vue-quill/dist/vue-quill.snow.css';

interface IProps {
    /** Содержимое редактора, HTML */
    modelValue?: string;
    /** Подсказка в пустом поле */
    placeholder?: string;
    /** Только чтение: тулбар скрыт, текст не редактируется */
    readonly?: boolean;
    /** Состав тулбара; по умолчанию — минимальный набор */
    toolbar?: string | unknown[] | false;
}

const props = withDefaults(defineProps<IProps>(), {
    modelValue: '',
    placeholder: '',
    readonly: false,
    toolbar: () => EDITOR_DEFAULT_TOOLBAR,
});

const emits = defineEmits<{
    'update:modelValue': [value: string];
}>();

const QuillEditor = defineAsyncComponent(async () => (await import('@vueup/vue-quill')).QuillEditor);

function onUpdate(value: unknown) {
    const html = typeof value === 'string' ? value : '';

    emits('update:modelValue', html === EDITOR_EMPTY_HTML ? '' : html);
}
</script>

<template>
    <div
        :class="[$style.VEditor, { 'v-editor--readonly': props.readonly }]"
        class="v-editor"
    >
        <ClientOnly>
            <QuillEditor
                theme="snow"
                content-type="html"
                :content="props.modelValue"
                :toolbar="props.toolbar"
                :placeholder="props.placeholder"
                :read-only="props.readonly"
                @update:content="onUpdate"
            />

            <template #fallback>
                <div :class="$style.fallback" />
            </template>
        </ClientOnly>
    </div>
</template>

<style module lang="scss">
.VEditor {
    width: 100%;
}

.fallback {
    min-height: 24rem;
    border: 1px solid $input-border;
    border-radius: $radius-8;
    background-color: $input-bg;
}
</style>

<style lang="scss">
.v-editor {
    .ql-toolbar.ql-snow {
        padding: $space-8;
        border: 1px solid $input-border;
        border-radius: $radius-8 $radius-8 0 0;
        background-color: $surface-sunken;
        font-family: $font-sans;
    }

    .ql-container.ql-snow {
        @include t2;

        border: 1px solid $input-border;
        border-top: 0;
        border-radius: 0 0 $radius-8 $radius-8;
        background-color: $input-bg;
        color: $input-text;
    }

    .ql-editor {
        min-height: 20rem;
        padding: $space-12;
    }

    .ql-editor.ql-blank::before {
        right: $space-12;
        left: $space-12;
        color: $input-placeholder;
        font-style: normal;
    }

    .ql-snow .ql-stroke {
        stroke: $text-secondary;
    }

    .ql-snow .ql-fill {
        fill: $text-secondary;
    }

    .ql-snow .ql-picker {
        color: $text-secondary;
    }

    .ql-toolbar.ql-snow button:hover .ql-stroke,
    .ql-toolbar.ql-snow .ql-picker-label:hover .ql-stroke,
    .ql-toolbar.ql-snow .ql-active .ql-stroke,
    .ql-toolbar.ql-snow .ql-active .ql-stroke-miter {
        stroke: $control-active;
    }

    .ql-toolbar.ql-snow button:hover .ql-fill,
    .ql-toolbar.ql-snow .ql-active .ql-fill,
    .ql-toolbar.ql-snow .ql-active .ql-stroke.ql-fill {
        fill: $control-active;
    }

    .ql-toolbar.ql-snow button:hover,
    .ql-toolbar.ql-snow .ql-picker-label:hover,
    .ql-toolbar.ql-snow .ql-picker-item:hover,
    .ql-toolbar.ql-snow .ql-active,
    .ql-toolbar.ql-snow .ql-picker-item.ql-selected {
        color: $control-active;
    }

    .ql-toolbar.ql-snow button:hover,
    .ql-toolbar.ql-snow .ql-picker-label:hover,
    .ql-toolbar.ql-snow .ql-picker-item:hover {
        border-radius: $radius-4;
        background-color: $surface;
    }

    .ql-toolbar.ql-snow .ql-active {
        border-radius: $radius-4;
        background-color: $surface-raised;
    }

    .ql-snow .ql-picker-options {
        border-radius: $radius-4;
        background-color: $surface-raised;
    }

    .ql-snow .ql-picker.ql-expanded .ql-picker-label,
    .ql-snow .ql-picker-options {
        border-color: $border;
    }

    .ql-snow a {
        color: $text-link;
    }

    .ql-snow .ql-tooltip {
        border: 1px solid $border;
        border-radius: $radius-4;
        background-color: $surface-raised;
        box-shadow: none;
        color: $text-primary;

        input {
            border: 1px solid $input-border;
            border-radius: $radius-4;
            background-color: $input-bg;
            color: $input-text;
        }

        a {
            color: $text-link;
        }
    }

    &.v-editor--readonly {
        .ql-toolbar.ql-snow {
            display: none;
        }

        .ql-container.ql-snow {
            border-top: 1px solid $input-border;
            border-radius: $radius-8;
            background-color: transparent;
        }

        .ql-editor {
            padding: 0;
        }
    }
}
</style>
