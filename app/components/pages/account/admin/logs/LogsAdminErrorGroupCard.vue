<script setup lang="ts">
import type { ILogEntryGroup } from '~~/shared/@types/logging';
import type { ELogCategory } from '~~/shared/enums/logging';

import { LOG_CATEGORY_LABEL } from '~~/shared/constants/logging';
import { ELogLevel } from '~~/shared/enums/logging';
import { LOGS_ADMIN } from '~/assets/ts/constants/content/account';
import { LOG_LEVEL_BADGE_COLOR } from '~/assets/ts/constants/logs';
import { EBadgeColor, ESize } from '~/assets/ts/enums/common';

import LogsAdminEntryCard from '~/components/pages/account/admin/logs/LogsAdminEntryCard.vue';

interface IProps {
    /** Группа одинаковых записей об ошибке одного игрока */
    group: ILogEntryGroup;
    /** Текущая выбранная категория журнала */
    category: ELogCategory;
    /** Имя текущего открытого файла */
    fileName: string;
}

const props = defineProps<IProps>();

const emits = defineEmits<{
    openCombat: [combatUuid: string];
}>();

const style = useCssModule();

const isExpanded = ref(false);

const primaryEntry = computed(() => props.group.primaryEntry);

const classList = computed(() => [
    primaryEntry.value.level === ELogLevel.Error ? style._error : '',
    primaryEntry.value.level === ELogLevel.Warn ? style._warn : '',
]);

const levelBadgeColor = computed<EBadgeColor>(() => {
    if (!primaryEntry.value.level) {
        return EBadgeColor.Danger;
    }

    return LOG_LEVEL_BADGE_COLOR[primaryEntry.value.level];
});

const levelLabel = computed(() => primaryEntry.value.level ?? ELogLevel.Error);

const categoryLabel = computed(() => LOG_CATEGORY_LABEL[props.category]);

const originCategoryLabel = computed<string | null>(() => {
    const rawCat = primaryEntry.value.fields.category;
    if (typeof rawCat !== 'string' || !rawCat || rawCat === props.category) {
        return null;
    }

    return getLogOriginCategoryLabel(rawCat);
});

const baseEvent = computed(() => normalizeLogEventCode(primaryEntry.value.event));

const formattedTimeRange = computed(() => {
    const earliest = props.group.earliestTimestamp
        ? formatLogTimestamp(props.group.earliestTimestamp)
        : null;
    const latest = props.group.latestTimestamp
        ? formatLogTimestamp(props.group.latestTimestamp)
        : null;

    if (earliest && latest && earliest !== latest) {
        return `${earliest} — ${latest}`;
    }

    return latest ?? earliest ?? formatLogTimestamp(primaryEntry.value.timestamp);
});

const title = computed(() => {
    const rawTitle = getLogEntryTitle(primaryEntry.value, LOGS_ADMIN.unparsedTitle);
    if (primaryEntry.value.event && rawTitle === primaryEntry.value.event && baseEvent.value) {
        return baseEvent.value;
    }

    return rawTitle;
});

const summaryMetaItems = computed(() => {
    const result: Array<{ label: string; value: string }> = [];
    const pairs: ReadonlyArray<[string, string]> = [
        ['player', 'Игрок'],
        ['actor', 'Инициатор'],
        ['target', 'Цель'],
        ['source', 'Источник'],
    ];

    for (const [key, label] of pairs) {
        const val = primaryEntry.value.fields[key];
        if (val !== undefined && val !== null && String(val).trim()) {
            result.push({ label, value: String(val) });
        }
    }

    return result;
});

const errorReasonSummary = computed<string | null>(() => {
    const f = primaryEntry.value.fields;
    const errName = typeof f.error_name === 'string' && f.error_name ? f.error_name : '';
    const errMsg = typeof f.error_message === 'string' && f.error_message
        ? f.error_message
        : typeof f.reason === 'string' && f.reason
            ? f.reason
            : '';

    if (errName && errMsg) {
        return `${errName}: ${errMsg}`;
    }

    return errMsg || errName || null;
});

function onOpenCombat(combatUuid: string): void {
    emits('openCombat', combatUuid);
}
</script>

<template>
    <article :class="[$style.LogsAdminErrorGroupCard, classList]">
        <div :class="$style.head">
            <div :class="$style.headLeft">
                <time :class="$style.time">{{ formattedTimeRange }}</time>

                <VBadge :color="levelBadgeColor" :size="ESize.Small">
                    {{ levelLabel }}
                </VBadge>

                <VBadge :color="EBadgeColor.Neutral" :size="ESize.Small">
                    {{ categoryLabel }}
                </VBadge>

                <VBadge
                    v-if="originCategoryLabel"
                    :color="EBadgeColor.Info"
                    :size="ESize.Small"
                >
                    {{ originCategoryLabel }}
                </VBadge>

                <span v-if="baseEvent" :class="$style.event">
                    {{ baseEvent }}
                </span>
            </div>

            <div :class="$style.headRight">
                <VBadge :color="EBadgeColor.Danger" :size="ESize.Small">
                    {{ LOGS_ADMIN.errorGroupEntriesPrefix }} {{ group.entries.length }}
                </VBadge>

                <VBadge
                    v-if="group.totalOccurrences > group.entries.length"
                    :color="EBadgeColor.Warning"
                    :size="ESize.Small"
                >
                    {{ LOGS_ADMIN.errorGroupTotalPrefix }} {{ group.totalOccurrences }}
                </VBadge>
            </div>
        </div>

        <h3 :class="$style.title">
            {{ title }}
        </h3>

        <div v-if="summaryMetaItems.length" :class="$style.participants">
            <span
                v-for="item in summaryMetaItems"
                :key="item.label"
                :class="$style.participant"
            >
                <span :class="$style.participantLabel">{{ item.label }}:</span>
                <span :class="$style.participantValue">{{ item.value }}</span>
            </span>
        </div>

        <div v-if="errorReasonSummary" :class="$style.reasonBox">
            {{ errorReasonSummary }}
        </div>

        <div :class="$style.footer">
            <button
                type="button"
                :class="$style.expandButton"
                @click="isExpanded = !isExpanded"
            >
                <VIcon
                    :name="isExpanded ? 'chevron-up' : 'chevron-down'"
                    :size="16"
                />
                <span>
                    {{ isExpanded ? LOGS_ADMIN.errorGroupToggleClose : LOGS_ADMIN.errorGroupToggleOpen }}
                    ({{ group.entries.length }})
                </span>
            </button>
        </div>

        <div v-if="isExpanded" :class="$style.entriesBreakdown">
            <LogsAdminEntryCard
                v-for="item in group.entries"
                :key="`${fileName}-${item.byteOffset}`"
                :entry="item"
                :category="category"
                :file-name="fileName"
                nested
                @open-combat="onOpenCombat"
            />
        </div>
    </article>
</template>

<style module lang="scss">
.LogsAdminErrorGroupCard {
    display: flex;
    flex-direction: column;
    gap: $space-12;
    padding: $space-16 $space-20;
    border: 1px solid $border-subtle;
    border-left: rem(4) solid $danger;
    border-radius: $radius-12;
    background-color: $surface-raised;

    &._warn {
        border-left-color: $warning;
    }

    @include respond-to(mobile) {
        padding: $space-12 $space-16;
    }
}

.head {
    display: flex;
    flex-wrap: wrap;
    gap: $space-12;
    justify-content: space-between;
    align-items: center;
}

.headLeft {
    display: flex;
    flex-wrap: wrap;
    gap: $space-8;
    align-items: center;
}

.headRight {
    display: flex;
    flex-wrap: wrap;
    gap: $space-8;
    align-items: center;
}

.time {
    @include mono2;

    color: $text-secondary;
}

.event {
    @include mono2;

    padding: $space-2 $space-8;
    border-radius: $radius-4;
    background-color: $surface-sunken;
    color: $text-primary;
}

.title {
    @include h5;

    color: $text-primary;
    overflow-wrap: anywhere;
}

.participants {
    display: flex;
    flex-wrap: wrap;
    gap: $space-16;
}

.participant {
    @include t3;

    display: inline-flex;
    gap: $space-4;
    align-items: center;
}

.participantLabel {
    color: $text-secondary;
}

.participantValue {
    color: $text-primary;
    font-weight: $fw-medium;
}

.reasonBox {
    @include t3;

    padding: $space-8 $space-12;
    border-radius: $radius-8;
    background-color: $danger-bg;
    color: $danger-fg;
    overflow-wrap: anywhere;
}

.footer {
    display: flex;
    align-items: center;
}

.expandButton {
    @include l3;

    display: inline-flex;
    gap: $space-4;
    align-items: center;
    padding: 0;
    color: $text-link;
    cursor: pointer;
    transition: color $default-transition;

    @include hover {
        color: $text-link-hover;
    }
}

.entriesBreakdown {
    display: flex;
    flex-direction: column;
    gap: $space-10;
    padding-top: $space-12;
    border-top: 1px solid $border-subtle;
}
</style>
