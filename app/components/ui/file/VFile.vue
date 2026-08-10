<script setup lang="ts">
import { FILE_DEFAULTS, FILE_ERRORS } from '~/assets/ts/constants/file';
import { ESize } from '~/assets/ts/enums/common';

interface IProps {
    /** Заголовок зоны загрузки */
    title?: string;
    /** Пояснение под заголовком: форматы и лимиты */
    description?: string;
    /** Подпись кнопки выбора файлов */
    button?: string;
    /** Иконка в кружке над заголовком */
    icon?: string;
    /** Значение `accept` нативного инпута — им же проверяются файлы из drag&drop */
    accept?: string;
    /** Разрешает выбрать несколько файлов сразу */
    multiple?: boolean;
    /** Максимум файлов в модели; `0` — без ограничения */
    max?: number;
    /** Максимальный размер одного файла, байт; `0` — без ограничения */
    maxSize?: number;
    /** Текст ошибки снаружи: показывается под зоной загрузки вместо своего */
    error?: string;
    /** Отключение выбора файлов */
    disabled?: boolean;
}

const props = withDefaults(defineProps<IProps>(), {
    title: FILE_DEFAULTS.title,
    description: '',
    button: FILE_DEFAULTS.button,
    icon: FILE_DEFAULTS.icon,
    accept: '',
    multiple: false,
    max: 0,
    maxSize: 0,
    error: '',
    disabled: false,
});

const emits = defineEmits<{
    change: [files: File[]];
    error: [message: string];
}>();

const model = defineModel<File[]>({ default: () => [] });

const style = useCssModule();

const ICON_SIZE = 20;

const input = useTemplateRef<HTMLInputElement>('input');
const root = useTemplateRef<HTMLElement>('root');

const isDragging = ref(false);
const ownError = ref('');

const isFull = computed(() => props.max > 0 && model.value.length >= props.max);

const isDisabled = computed(() => props.disabled || isFull.value);

const errorText = computed(() => props.error || ownError.value);

const classList = computed(() => [
    isDragging.value ? style._dragging : '',
    isDisabled.value ? style._disabled : '',
]);

function fail(message: string) {
    ownError.value = message;

    emits('error', message);
}

function getFileKey(file: File): string {
    return `${file.name}-${file.size}-${file.lastModified}`;
}

function addFiles(files: File[]) {
    ownError.value = '';

    const accepted: File[] = [];

    // Инпут очищается после выбора, поэтому один и тот же файл можно выбрать
    // повторно: в модели окажутся два неотличимых друг от друга элемента.
    const keys = new Set(model.value.map(getFileKey));

    for (const file of files) {
        if (props.max > 0 && model.value.length + accepted.length >= props.max) {
            fail(FILE_ERRORS.LIMIT);
            break;
        }

        if (!isFileAccepted(file, props.accept)) {
            fail(FILE_ERRORS.TYPE);
            continue;
        }

        if (props.maxSize > 0 && file.size > props.maxSize) {
            fail(FILE_ERRORS.SIZE);
            continue;
        }

        if (keys.has(getFileKey(file))) {
            fail(FILE_ERRORS.DUPLICATE);
            continue;
        }

        keys.add(getFileKey(file));
        accepted.push(file);
    }

    if (!accepted.length) {
        return;
    }

    model.value = props.multiple ? [...model.value, ...accepted] : accepted.slice(0, 1);

    emits('change', accepted);
}

function open() {
    input.value?.click();
}

function onChange(event: Event) {
    const target = event.target as HTMLInputElement;

    addFiles(Array.from(target.files ?? []));

    target.value = '';
}

function onDragOver() {
    isDragging.value = !isDisabled.value;
}

function onDragLeave(event: DragEvent) {
    if (root.value?.contains(event.relatedTarget as Node | null)) {
        return;
    }

    isDragging.value = false;
}

function onDrop(event: DragEvent) {
    isDragging.value = false;

    if (isDisabled.value) {
        return;
    }

    addFiles(Array.from(event.dataTransfer?.files ?? []));
}
</script>

<template>
    <div
        ref="root"
        :class="[$style.VFile, classList]"
        class="v-file"
        @dragover.prevent="onDragOver"
        @dragleave="onDragLeave"
        @drop.prevent="onDrop"
    >
        <input
            ref="input"
            type="file"
            :accept="props.accept"
            :multiple="props.multiple"
            :disabled="isDisabled"
            :class="$style.native"
            @change="onChange"
        >

        <div :class="$style.iconWrapper" class="v-file__icon">
            <VIcon :name="props.icon" :size="ICON_SIZE" />
        </div>

        <div :class="$style.title" class="v-file__title">
            {{ props.title }}
        </div>

        <div
            v-if="props.description"
            :class="$style.description"
            class="v-file__description"
        >
            {{ props.description }}
        </div>

        <VButton
            type="button"
            :icon="FILE_DEFAULTS.buttonIcon"
            :disabled="isDisabled"
            :size="ESize.Small"
            :class="$style.button"
            class="v-file__button"
            @click="open"
        >
            {{ props.button }}
        </VButton>

        <Transition name="fade">
            <span v-if="errorText" :class="$style.error">{{ errorText }}</span>
        </Transition>
    </div>
</template>

<style module lang="scss">
.VFile {
    display: flex;
    flex-direction: column;
    gap: $space-4;
    justify-content: center;
    align-items: center;
    padding: $space-20 $space-16;
    border: 1px solid $border-subtle;
    border-radius: $radius-8;
    background-color: $surface-raised;
    text-align: center;
    transition: all $default-transition;

    &._dragging {
        border-color: $border-focus;
        background-color: $surface-sunken;
    }

    &._disabled {
        .iconWrapper {
            color: $text-muted;
        }
    }
}

.native {
    display: none;
}

.iconWrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    width: $space-40;
    height: $space-40;
    margin-bottom: $space-8;
    border-radius: 50%;
    background-color: $surface-sunken;
    color: $text-link;
}

.title {
    @include h5;
}

.description {
    @include t4;

    color: $text-secondary;
}

.button {
    margin-top: $space-12;
}

.error {
    @include t4;

    margin-top: $space-8;
    color: $danger;
}
</style>
