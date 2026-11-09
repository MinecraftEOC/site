<script setup lang="ts">
import type { ILogFileItem } from '~~/shared/@types/logging';

import { LOGS_FILE_SEARCH_MAX_LENGTH } from '~~/shared/constants/logging';
import { LOGS_ADMIN } from '~/assets/ts/constants/content/account';
import { ESize } from '~/assets/ts/enums/common';

interface IProps {
    /** Список файлов текущей категории */
    files: ILogFileItem[];
    /** Общее количество файлов в категории после фильтрации */
    totalFiles: number;
    /** Текущий выбранный файл */
    selectedFile: ILogFileItem | null;
    /** Загружается ли список файлов */
    loading?: boolean;
    /** Текст ошибки загрузки списка файлов */
    error?: string;
}

const props = withDefaults(defineProps<IProps>(), {
    loading: false,
    error: '',
});

const emits = defineEmits<{
    select: [file: ILogFileItem];
}>();

const search = defineModel<string>('search', { default: '' });

const style = useCssModule();

function getFileItemClassList(file: ILogFileItem): string[] {
    return [
        props.selectedFile?.name === file.name ? style._activeFile : '',
    ];
}
</script>

<template>
    <aside :class="$style.LogsAdminFilesSidebar">
        <div :class="$style.header">
            <span :class="$style.title">{{ LOGS_ADMIN.filesTitle }}</span>
            <span :class="$style.count">{{ totalFiles }}</span>
        </div>

        <VInput
            v-model="search"
            icon="search"
            :size="ESize.Small"
            :maxlength="LOGS_FILE_SEARCH_MAX_LENGTH"
            :placeholder="LOGS_ADMIN.fileSearchPlaceholder"
            :class="$style.searchInput"
        />

        <div v-if="error" :class="$style.notice">
            {{ error }}
        </div>

        <div v-else-if="loading && !files.length" :class="$style.notice">
            {{ LOGS_ADMIN.loadingFiles }}
        </div>

        <div v-else-if="!files.length" :class="$style.notice">
            {{ LOGS_ADMIN.emptyFiles.title }}
        </div>

        <ul v-else :class="$style.list">
            <li
                v-for="file in files"
                :key="file.name"
            >
                <button
                    type="button"
                    :class="[$style.fileButton, getFileItemClassList(file)]"
                    @click="emits('select', file)"
                >
                    <div :class="$style.fileRowTop">
                        <VIcon
                            name="file-text"
                            :size="14"
                            :class="$style.fileIcon"
                        />
                        <span :class="$style.fileName">{{ file.name }}</span>
                    </div>

                    <div :class="$style.fileRowMeta">
                        <span>{{ formatLogBytes(file.sizeBytes) }}</span>
                        <span>·</span>
                        <span>{{ formatLogFileDate(file.modifiedAt) }}</span>
                    </div>
                </button>
            </li>
        </ul>
    </aside>
</template>

<style module lang="scss">
.LogsAdminFilesSidebar {
    display: flex;
    flex-direction: column;
    gap: $space-12;
    padding: $space-16;
    border: 1px solid $border-subtle;
    border-radius: $radius-12;
    background-color: $surface-raised;
}

.header {
    display: flex;
    gap: $space-8;
    justify-content: space-between;
    align-items: center;
}

.title {
    @include l2;

    color: $text-primary;
}

.count {
    @include mono2;

    padding: $space-2 $space-8;
    border-radius: $radius-full;
    background-color: $surface-sunken;
    color: $text-secondary;
}

.searchInput {
    width: 100%;

    & :global(.v-input__native) {
        width: 100%;
    }
}

.notice {
    @include t3;

    padding: $space-16 $space-8;
    color: $text-secondary;
    text-align: center;
}

.list {
    display: flex;
    flex-direction: column;
    gap: $space-8;
    overflow-y: auto;
    max-height: rem(540);

    @include respond-to(tablet) {
        max-height: rem(240);
    }
}

.fileButton {
    display: flex;
    flex-direction: column;
    gap: $space-4;
    width: 100%;
    padding: $space-10 $space-12;
    border: 1px solid $border-subtle;
    border-radius: $radius-8;
    background-color: $surface;
    text-align: left;
    cursor: pointer;
    transition: all $default-transition;

    @include hover {
        border-color: $border;
        background-color: $surface-sunken;
    }

    &._activeFile {
        border-color: $border-focus;
        background-color: $tag-selected-bg;
    }
}

.fileRowTop {
    display: flex;
    gap: $space-8;
    align-items: center;
    min-width: 0;
}

.fileIcon {
    flex-shrink: 0;
    color: $text-link;
}

.fileName {
    @include mono2;

    overflow: hidden;
    color: $text-primary;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.fileRowMeta {
    @include t4;

    display: flex;
    flex-wrap: wrap;
    gap: $space-4;
    color: $text-secondary;
}
</style>
