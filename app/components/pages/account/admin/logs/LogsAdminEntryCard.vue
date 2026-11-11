<script setup lang="ts">
import type { ILogEntryItem } from '~~/shared/@types/logging';
import type { ELogCheckOutcome } from '~~/shared/enums/logging';

import { LOG_CATEGORY_LABEL } from '~~/shared/constants/logging';
import { ELogCategory, ELogLevel } from '~~/shared/enums/logging';
import { LOGS_ADMIN } from '~/assets/ts/constants/content/account';
import { COPY_NOTIFICATION } from '~/assets/ts/constants/content/common';
import { LOG_LEVEL_BADGE_COLOR, LOG_OUTCOME_BADGE_COLOR } from '~/assets/ts/constants/logs';
import { EBadgeColor, EColor, ENotificationType, ESize } from '~/assets/ts/enums/common';

interface IProps {
    /** Разобранная запись журнала */
    entry: ILogEntryItem;
    /** Текущая выбранная категория журнала */
    category: ELogCategory;
    /** Имя текущего открытого файла */
    fileName: string;
    /** Вложенный режим отображения внутри группы ошибок */
    nested?: boolean;
}

const props = withDefaults(defineProps<IProps>(), {
    nested: false,
});

const emits = defineEmits<{
    openCombat: [combatUuid: string];
}>();

const style = useCssModule();
const notificationStore = useNotificationStore();

const isDetailsOpen = ref(false);
const isTechParamsOpen = ref(false);

const classList = computed(() => [
    props.entry.parseError ? style._invalid : '',
    props.entry.level === ELogLevel.Error ? style._error : '',
    props.entry.level === ELogLevel.Warn ? style._warn : '',
    props.nested ? style._nested : '',
]);

const levelBadgeColor = computed<EBadgeColor>(() => {
    if (!props.entry.level) {
        return EBadgeColor.Warning;
    }

    return LOG_LEVEL_BADGE_COLOR[props.entry.level];
});

const levelLabel = computed(() => props.entry.level ?? 'СТРОКА');

const formattedTime = computed(() => formatLogTimestamp(props.entry.timestamp));

const categoryLabel = computed(() => LOG_CATEGORY_LABEL[props.category]);

const originCategoryLabel = computed<string | null>(() => {
    const rawCat = props.entry.fields.category;
    if (typeof rawCat !== 'string' || !rawCat || rawCat === props.category) {
        return null;
    }

    return getLogOriginCategoryLabel(rawCat);
});

const title = computed(() => getLogEntryTitle(props.entry, LOGS_ADMIN.unparsedTitle));

const participants = computed(() => {
    const result: Array<{ label: string; value: string }> = [];
    const pairs: ReadonlyArray<[string, string]> = [
        ['player', 'Игрок'],
        ['actor', 'Инициатор'],
        ['target', 'Цель'],
    ];

    for (const [key, label] of pairs) {
        const val = props.entry.fields[key];
        if (val !== undefined && val !== null && String(val).trim()) {
            result.push({ label, value: String(val) });
        }
    }

    return result;
});

const isCheckEntry = computed(() => {
    return props.entry.event === 'skill.check.resolved' || Boolean(props.entry.fields.check_type);
});

const checkOutcomeBadgeColor = computed<EBadgeColor>(() => {
    const outcome = props.entry.fields.outcome;
    if (typeof outcome === 'string' && outcome in LOG_OUTCOME_BADGE_COLOR) {
        return LOG_OUTCOME_BADGE_COLOR[outcome as ELogCheckOutcome];
    }

    if (props.entry.fields.success === true) {
        return EBadgeColor.Success;
    }

    if (props.entry.fields.success === false) {
        return EBadgeColor.Danger;
    }

    return EBadgeColor.Info;
});

const checkOutcomeTitle = computed(() => getLogCheckOutcomeTitle(props.entry));

const checkTypeBadge = computed<string | null>(() => {
    const ct = props.entry.fields.check_type;
    if (typeof ct !== 'string' || !ct) {
        return null;
    }

    const checkTitle = getLogCheckTypeTitle(ct);
    return checkTitle === ct ? ct : `${checkTitle} (${ct})`;
});

const checkMetrics = computed(() => {
    const f = props.entry.fields;
    const items: Array<{ label: string; value: string }> = [];
    const metricDefs: ReadonlyArray<[string, string]> = [
        ['roll', 'd20'],
        ['param', 'Параметр'],
        ['skill', 'Навык'],
        ['modifier', 'Модификатор'],
        ['bonus', 'Бонус'],
        ['result', 'Итог'],
        ['total', 'Итог'],
        ['difficulty', 'Сложность'],
    ];

    const seenLabels = new Set<string>();
    for (const [key, label] of metricDefs) {
        const val = f[key];
        if (val !== undefined && val !== null && !seenLabels.has(label)) {
            seenLabels.add(label);
            items.push({ label, value: String(val) });
        }
    }

    if (f.advantage === true) {
        items.push({ label: 'Режим', value: 'Преимущество' });
    } else if (f.disadvantage === true) {
        items.push({ label: 'Режим', value: 'Помеха' });
    }

    return items;
});

const combatUuid = computed<string | null>(() => {
    const val = props.entry.fields.combat;
    return typeof val === 'string' && val.trim() ? val.trim() : null;
});

const roundBadge = computed<string | null>(() => {
    const val = props.entry.fields.round;
    if (val === undefined || val === null || String(val).trim() === '') {
        return null;
    }

    return String(val);
});

const combatMetrics = computed(() => {
    const f = props.entry.fields;
    const items: Array<{ label: string; value: string }> = [];
    const defs: ReadonlyArray<[string, string]> = [
        ['damage', 'Урон'],
        ['applied', 'Применено'],
        ['hp_before', 'HP до'],
        ['hp_after', 'HP после'],
    ];

    for (const [key, label] of defs) {
        const val = f[key];
        if (val !== undefined && val !== null) {
            items.push({ label, value: String(val) });
        }
    }

    return items;
});

const errorReasonSummary = computed<string | null>(() => {
    const f = props.entry.fields;
    if (typeof f.error_message === 'string' && f.error_message) {
        return f.error_message;
    }

    if (typeof f.reason === 'string' && f.reason) {
        return f.reason;
    }

    return null;
});

const fieldEntries = computed(() => {
    return Object.entries(props.entry.fields).map(([key, value]) => ({
        key,
        label: getLogFieldLabel(key),
        value: formatLogFieldValue(value),
        isMultiline: key === 'stack' || key === 'details' || (typeof value === 'string' && value.includes('\n')),
        isTechnical: isTechnicalLogField(key),
    }));
});

const mainFieldEntries = computed(() => {
    return fieldEntries.value.filter(field => !field.isTechnical);
});

const technicalFieldEntries = computed(() => {
    return fieldEntries.value.filter(field => field.isTechnical);
});

const totalTechnicalCount = computed(() => {
    const baseCount = props.entry.timestamp ? 2 : 1;
    return baseCount + technicalFieldEntries.value.length;
});

const repeatedCountBadge = computed<number | null>(() => {
    const countVal = props.entry.fields.count;
    if (typeof countVal === 'number' && countVal > 1) {
        return countVal;
    }

    return null;
});

const showOpenCombatButton = computed(() => {
    if (!combatUuid.value) {
        return false;
    }

    return !(props.category === ELogCategory.Combat && props.fileName.toLowerCase() === `${combatUuid.value.toLowerCase()}.log`);
});

async function onCopyRaw() {
    try {
        await navigator.clipboard.writeText(props.entry.raw);
        notificationStore.add(LOGS_ADMIN.rawLineCopied);
    } catch {
        notificationStore.add(COPY_NOTIFICATION.error, '', ENotificationType.Error);
    }
}

function onOpenCombatClick() {
    if (combatUuid.value) {
        emits('openCombat', combatUuid.value);
    }
}
</script>

<template>
    <article :class="[$style.LogsAdminEntryCard, classList]">
        <div :class="$style.head">
            <div :class="$style.headLeft">
                <time :class="$style.time">{{ formattedTime }}</time>

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

                <span v-if="entry.event" :class="$style.event">
                    {{ entry.event }}
                </span>

                <VBadge
                    v-if="roundBadge"
                    :color="EBadgeColor.Neutral"
                    :size="ESize.Small"
                >
                    Раунд {{ roundBadge }}
                </VBadge>

                <VBadge
                    v-if="repeatedCountBadge"
                    :color="EBadgeColor.Warning"
                    :size="ESize.Small"
                >
                    ×{{ repeatedCountBadge }}
                </VBadge>
            </div>

            <span :class="$style.offset">
                #{{ entry.byteOffset }}
            </span>
        </div>

        <h3 :class="$style.title">
            {{ title }}
        </h3>

        <div v-if="participants.length" :class="$style.participants">
            <span
                v-for="person in participants"
                :key="person.label"
                :class="$style.participant"
            >
                <span :class="$style.participantLabel">{{ person.label }}:</span>
                <span :class="$style.participantValue">{{ person.value }}</span>
            </span>
        </div>

        <div v-if="isCheckEntry" :class="$style.summaryBox">
            <div :class="$style.summaryMain">
                <div :class="$style.summaryBadges">
                    <VBadge :color="checkOutcomeBadgeColor" :size="ESize.Small">
                        {{ checkOutcomeTitle }}
                    </VBadge>

                    <VBadge
                        v-if="checkTypeBadge"
                        :color="EBadgeColor.Neutral"
                        :size="ESize.Small"
                    >
                        {{ checkTypeBadge }}
                    </VBadge>
                </div>

                <div v-if="checkMetrics.length" :class="$style.metrics">
                    <span
                        v-for="metric in checkMetrics"
                        :key="metric.label"
                        :class="$style.metricItem"
                    >
                        <span :class="$style.metricLabel">{{ metric.label }}:</span>
                        <span :class="$style.metricValue">{{ metric.value }}</span>
                    </span>
                </div>
            </div>

            <VButton
                v-if="category === ELogCategory.Checks && showOpenCombatButton"
                :size="ESize.Small"
                :color="EColor.Secondary"
                icon="swords"
                @click="onOpenCombatClick"
            >
                {{ LOGS_ADMIN.openCombatButton }}
            </VButton>
        </div>

        <div
            v-if="category !== ELogCategory.Checks && (combatMetrics.length || showOpenCombatButton)"
            :class="$style.combatBox"
        >
            <div v-if="combatMetrics.length" :class="$style.combatInfo">
                <span
                    v-for="metric in combatMetrics"
                    :key="metric.label"
                    :class="$style.metricItem"
                >
                    <span :class="$style.metricLabel">{{ metric.label }}:</span>
                    <span :class="$style.metricValue">{{ metric.value }}</span>
                </span>
            </div>

            <VButton
                v-if="showOpenCombatButton"
                :size="ESize.Small"
                :color="EColor.Secondary"
                icon="swords"
                @click="onOpenCombatClick"
            >
                {{ LOGS_ADMIN.openCombatButton }}
            </VButton>
        </div>

        <div v-if="errorReasonSummary" :class="$style.reasonBox">
            {{ errorReasonSummary }}
        </div>

        <div v-if="entry.parseError || entry.rawTruncated" :class="$style.parseWarning">
            <VIcon name="triangle-alert" :size="16" />

            <span>
                <template v-if="entry.parseError">
                    {{ LOGS_ADMIN.parseErrorPrefix }} {{ entry.parseError }}
                </template>
                <template v-else>
                    {{ LOGS_ADMIN.truncatedNotice }}
                </template>
            </span>
        </div>

        <div :class="$style.footer">
            <button
                type="button"
                :class="$style.detailsButton"
                @click="isDetailsOpen = !isDetailsOpen"
            >
                <VIcon
                    :name="isDetailsOpen ? 'chevron-up' : 'chevron-down'"
                    :size="16"
                />
                {{ isDetailsOpen ? LOGS_ADMIN.detailsToggleClose : LOGS_ADMIN.detailsToggleOpen }}
            </button>
        </div>

        <div v-if="isDetailsOpen" :class="$style.details">
            <dl v-if="mainFieldEntries.length" :class="$style.fieldsGrid">
                <div
                    v-for="field in mainFieldEntries"
                    :key="field.key"
                    :class="$style.fieldRow"
                >
                    <dt :class="$style.fieldTerm">
                        {{ field.label }}
                    </dt>
                    <dd :class="$style.fieldValue">
                        <pre v-if="field.isMultiline" :class="$style.codeBlock">{{ field.value }}</pre>
                        <span v-else>{{ field.value }}</span>
                    </dd>
                </div>
            </dl>

            <div :class="$style.techSection">
                <button
                    type="button"
                    :class="$style.techToggleButton"
                    @click="isTechParamsOpen = !isTechParamsOpen"
                >
                    <VIcon
                        :name="isTechParamsOpen ? 'chevron-up' : 'chevron-down'"
                        :size="15"
                    />
                    <span>
                        {{ isTechParamsOpen ? LOGS_ADMIN.techParamsToggleClose : LOGS_ADMIN.techParamsToggleOpen }}
                        ({{ totalTechnicalCount }})
                    </span>
                </button>

                <dl v-if="isTechParamsOpen" :class="[$style.fieldsGrid, $style.techFieldsGrid]">
                    <div :class="$style.fieldRow">
                        <dt :class="$style.fieldTerm">
                            {{ LOGS_ADMIN.fileFieldLabel }}
                        </dt>
                        <dd :class="$style.fieldValue">
                            {{ category }}/{{ fileName }} ({{ LOGS_ADMIN.byteOffsetLabel }}: {{ entry.byteOffset }})
                        </dd>
                    </div>

                    <div v-if="entry.timestamp" :class="$style.fieldRow">
                        <dt :class="$style.fieldTerm">
                            {{ LOGS_ADMIN.originalTimestampLabel }}
                        </dt>
                        <dd :class="$style.fieldValue">
                            {{ formattedTime }}
                        </dd>
                    </div>

                    <div
                        v-for="field in technicalFieldEntries"
                        :key="field.key"
                        :class="$style.fieldRow"
                    >
                        <dt :class="$style.fieldTerm">
                            {{ field.label }}
                        </dt>
                        <dd :class="$style.fieldValue">
                            <pre v-if="field.isMultiline" :class="$style.codeBlock">{{ field.value }}</pre>
                            <span v-else>{{ field.value }}</span>
                        </dd>
                    </div>
                </dl>
            </div>

            <div :class="$style.rawSection">
                <div :class="$style.rawHeader">
                    <span :class="$style.rawTitle">{{ LOGS_ADMIN.rawLineTitle }}</span>

                    <VButton
                        :size="ESize.Small"
                        :color="EColor.Secondary"
                        icon="copy"
                        @click="onCopyRaw"
                    >
                        {{ LOGS_ADMIN.copyRawButton }}
                    </VButton>
                </div>

                <pre :class="$style.codeBlock">{{ entry.raw }}</pre>
            </div>
        </div>
    </article>
</template>

<style module lang="scss">
.LogsAdminEntryCard {
    display: flex;
    flex-direction: column;
    gap: $space-12;
    padding: $space-16 $space-20;
    border: 1px solid $border-subtle;
    border-left: rem(4) solid $border;
    border-radius: $radius-12;
    background-color: $surface-raised;

    &._error {
        border-left-color: $danger;
    }

    &._warn,
    &._invalid {
        border-left-color: $warning;
    }

    &._nested {
        padding: $space-12 $space-16;
        background-color: $surface;
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

.offset {
    @include mono3;

    color: $text-muted;
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

.summaryBox {
    display: flex;
    flex-wrap: wrap;
    gap: $space-12;
    justify-content: space-between;
    align-items: center;
    padding: $space-10 $space-12;
    border: 1px solid $border-subtle;
    border-radius: $radius-8;
    background-color: $surface;
}

.summaryMain {
    display: flex;
    flex-wrap: wrap;
    gap: $space-12;
    align-items: center;
}

.summaryBadges {
    display: flex;
    flex-wrap: wrap;
    gap: $space-8;
    align-items: center;
}

.metrics {
    display: flex;
    flex-wrap: wrap;
    gap: $space-12;
    align-items: center;
}

.metricItem {
    @include t3;

    display: inline-flex;
    gap: $space-4;
    align-items: baseline;
}

.metricLabel {
    color: $text-secondary;
}

.metricValue {
    @include mono2;

    color: $text-primary;
}

.combatBox {
    display: flex;
    flex-wrap: wrap;
    gap: $space-12;
    justify-content: space-between;
    align-items: center;
    padding: $space-10 $space-12;
    border: 1px solid $border-subtle;
    border-radius: $radius-8;
    background-color: $surface;
}

.combatInfo {
    display: flex;
    flex-wrap: wrap;
    gap: $space-12;
    align-items: center;
}

.reasonBox {
    @include t3;

    padding: $space-8 $space-12;
    border-radius: $radius-8;
    background-color: $danger-bg;
    color: $danger-fg;
    overflow-wrap: anywhere;
}

.parseWarning {
    @include t3;

    display: flex;
    gap: $space-8;
    align-items: center;
    padding: $space-8 $space-12;
    border-radius: $radius-8;
    background-color: $warning-bg;
    color: $warning-fg;
}

.footer {
    display: flex;
    align-items: center;
}

.detailsButton {
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

.details {
    display: flex;
    flex-direction: column;
    gap: $space-16;
    padding-top: $space-12;
    border-top: 1px solid $border-subtle;
}

.fieldsGrid {
    display: flex;
    flex-direction: column;
    gap: $space-8;
}

.fieldRow {
    display: grid;
    grid-template-columns: rem(240) minmax(0, 1fr);
    gap: $space-12;
    align-items: baseline;

    @include respond-to(mobile) {
        grid-template-columns: 1fr;
        gap: $space-2;
    }
}

.fieldTerm {
    @include l3;

    color: $text-secondary;
    overflow-wrap: anywhere;
}

.fieldValue {
    @include mono2;

    color: $text-primary;
    overflow-wrap: anywhere;
}

.techSection {
    display: flex;
    flex-direction: column;
    gap: $space-12;
    padding-top: $space-8;
    border-top: 1px dashed $border-subtle;
}

.techToggleButton {
    @include l3;

    display: inline-flex;
    gap: $space-4;
    align-items: center;
    align-self: flex-start;
    padding: $space-4 $space-8;
    border: 1px solid $border-subtle;
    border-radius: $radius-8;
    background-color: $surface;
    color: $text-secondary;
    cursor: pointer;
    transition: border-color $default-transition, color $default-transition;

    @include hover {
        border-color: $border;
        color: $text-primary;
    }
}

.techFieldsGrid {
    padding: $space-10 $space-12;
    border: 1px solid $border-subtle;
    border-radius: $radius-8;
    background-color: $surface;
}

.rawSection {
    display: flex;
    flex-direction: column;
    gap: $space-8;
}

.rawHeader {
    display: flex;
    flex-wrap: wrap;
    gap: $space-12;
    justify-content: space-between;
    align-items: center;
}

.rawTitle {
    @include l3;

    color: $text-secondary;
}

.codeBlock {
    @include mono2;

    margin: 0;
    padding: $space-12;
    border: 1px solid $border-subtle;
    border-radius: $radius-8;
    background-color: $surface-sunken;
    color: $text-primary;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
}
</style>
