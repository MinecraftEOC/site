<script setup lang="ts">
import { EDITOR_DEFAULT_TOOLBAR, EDITOR_EMPTY_HTML } from '~/assets/ts/constants/editor';

import '@vueup/vue-quill/dist/vue-quill.snow.css';

interface IProps {
    /** Содержимое редактора, HTML */
    modelValue?: string;
    /** Лейбл */
    label?: string;
    /** Текст подсказки — рядом с лейблом появляется иконка с тултипом */
    hint?: string;
    /** Подсказка в пустом поле */
    placeholder?: string;
    /** Только чтение: тулбар скрыт, текст не редактируется */
    readonly?: boolean;
    /** Состав тулбара; по умолчанию — минимальный набор */
    toolbar?: string | unknown[] | false;
    /**
     * Максимальная высота поля ввода. Числом — в px по макету 1440px
     * (240 → 24rem), строкой — готовое CSS-значение. Без неё поле тянется на
     * всю доступную высоту родителя.
     */
    maxHeight?: string | number;
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

const READONLY_CLASS = 'v-editor--readonly';

const classList = computed(() => [props.readonly ? READONLY_CLASS : '']);

/**
 * Ограничение уезжает в CSS-переменную: сам `.ql-container` рисует Quill, снаружи
 * до него не дотянуться инлайновым стилем.
 */
const maxHeightStyle = computed(() => {
    if (props.maxHeight === undefined) {
        return undefined;
    }

    return { '--v-editor-max-height': typeof props.maxHeight === 'number' ? rem(props.maxHeight) : props.maxHeight };
});

function onUpdate(value: unknown) {
    const html = typeof value === 'string' ? value : '';

    emits('update:modelValue', html === EDITOR_EMPTY_HTML ? '' : html);
}
</script>

<template>
    <div
        :class="[$style.VEditor, classList]"
        :style="maxHeightStyle"
        class="v-editor"
    >
        <span
            v-if="props.label"
            :class="$style.label"
            class="v-editor__label"
        >
            {{ props.label }}

            <VTooltip
                v-if="props.hint"
                :text="props.hint"
            >
                <VIcon name="info" :size="12" />
            </VTooltip>
        </span>

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
    display: flex;
    flex: 1;
    flex-direction: column;
    width: 100%;
    height: 100%;
    min-height: 0;
}

.label {
    @include l2;

    display: inline-flex;
    gap: $space-4;
    align-items: center;
    align-self: flex-start;
    margin-bottom: $space-8;
}

.fallback {
    flex: 1;
    min-height: min(#{$editor-min-height}, var(--v-editor-max-height, #{$editor-min-height}));
    max-height: var(--v-editor-max-height, none);
    border: 1px solid $input-border;
    border-radius: $radius-8;
    background-color: $input-bg;
}
</style>

<style lang="scss">
.v-editor {
    .ql-toolbar.ql-snow {
        flex-shrink: 0;
        padding: $space-8;
        border: 1px solid $input-border;
        border-radius: $radius-4 $radius-4 0 0;
        background-color: $surface-sunken;
        font-family: $font-sans;
    }

    .ql-container.ql-snow {
        @include t3;

        flex: 1;
        min-height: min(#{$editor-min-height}, var(--v-editor-max-height, #{$editor-min-height}));
        max-height: var(--v-editor-max-height, none);
        border: 1px solid $input-border;
        border-top: 0;
        border-radius: 0 0 $radius-4 $radius-4;
        background-color: $input-bg;
        color: $input-text;
    }

    .ql-editor {
        padding: $space-12;
    }

    .ql-editor.ql-blank::before {
        @include t3;

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
