<script setup lang="ts">
import type { ILogEntryFileMeta, ILogFileItem } from '~~/shared/@types/logging';
import type { ELogCategory } from '~~/shared/enums/logging';

import { LOGS_ADMIN } from '~/assets/ts/constants/content/account';

interface IProps {
    /** Выбранная категория журналов */
    category: ELogCategory;
    /** Выбранный файл из списка */
    file: ILogFileItem;
    /** Актуальные метаданные файла из ответа чтения записей */
    fileMeta?: ILogEntryFileMeta | null;
}

const props = withDefaults(defineProps<IProps>(), {
    fileMeta: null,
});

const displaySize = computed(() => formatLogBytes(props.fileMeta?.sizeBytes ?? props.file.sizeBytes));
const displayModifiedAt = computed(() => formatLogFileDate(props.fileMeta?.modifiedAt ?? props.file.modifiedAt));
</script>

<template>
    <div :class="$style.LogsAdminFileHeader">
        <div :class="$style.main">
            <div :class="$style.titleRow">
                <span :class="$style.path">
                    {{ category }}/{{ file.name }}
                </span>

                <span :class="$style.sizeBadge">
                    {{ displaySize }}
                </span>
            </div>

            <div :class="$style.sub">
                {{ LOGS_ADMIN.modifiedPrefix }} {{ displayModifiedAt }}
            </div>
        </div>

        <div v-if="file.combatUuid" :class="$style.combatCopyWrap">
            <VCopyField
                :value="file.combatUuid"
                :notification="LOGS_ADMIN.combatUuidCopied"
            />
        </div>
    </div>
</template>

<style module lang="scss">
.LogsAdminFileHeader {
    display: flex;
    flex-wrap: wrap;
    gap: $space-16;
    justify-content: space-between;
    align-items: center;
    padding: $space-16 $space-20;
    border: 1px solid $border-subtle;
    border-radius: $radius-12;
    background-color: $surface-raised;
}

.main {
    display: flex;
    flex-direction: column;
    gap: $space-4;
    min-width: 0;
}

.titleRow {
    display: flex;
    flex-wrap: wrap;
    gap: $space-12;
    align-items: center;
}

.path {
    @include mono;

    color: $text-primary;
    font-weight: $fw-bold;
    overflow-wrap: anywhere;
}

.sizeBadge {
    @include mono2;

    padding: $space-2 $space-8;
    border-radius: $radius-4;
    background-color: $surface-sunken;
    color: $text-secondary;
}

.sub {
    @include t3;

    color: $text-secondary;
}

.combatCopyWrap {
    width: 100%;
    max-width: rem(420);
}
</style>
