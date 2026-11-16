<script setup lang="ts">
import type { ILogEntryItem, TLogFieldValue } from '~~/shared/@types/logging';
import type { ELogCheckOutcome } from '~~/shared/enums/logging';

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
    /** Краткое представление записи в хронологии боя */
    compact?: boolean;
    /** Остальные записи того же боевого действия. */
    relatedEntries?: ILogEntryItem[];
}

const props = withDefaults(defineProps<IProps>(), {
    nested: false,
    relatedEntries: () => [],
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
    props.compact ? style._compact : '',
]);

const levelBadgeColor = computed<EBadgeColor>(() => {
    if (!props.entry.level) {
        return EBadgeColor.Warning;
    }

    return LOG_LEVEL_BADGE_COLOR[props.entry.level];
});

const levelLabel = computed(() => props.entry.level ?? 'СТРОКА');

const formattedTime = computed(() => formatLogTimestamp(props.entry.timestamp));

const equipmentReadinessColors = new Map<string, EBadgeColor>([
    ['готов', EBadgeColor.Success],
    ['не готов', EBadgeColor.Warning],
]);

const isEquipmentChange = computed(() => normalizeLogEventCode(props.entry.event) === 'combat.equipment.changed');

const equipmentChanges = computed(() => {
    if (!isEquipmentChange.value) {
        return [];
    }

    return [...props.relatedEntries, props.entry].flatMap((entry) => {
        if (normalizeLogEventCode(entry.event) !== 'combat.equipment.changed') {
            return [];
        }

        const { fields } = entry;
        const category = getLogEquipmentCategory(entry);
        const hand = getFieldText(fields.hand);
        const item = getFieldText(fields.item_name) || getFieldText(fields.item_id);
        const previousItem = getFieldText(fields.previous_item_name) || getFieldText(fields.previous_item_id);
        const readiness = category ? getFieldText(fields.readiness) : '';
        return hand || category || item || previousItem
            ? [{ offset: entry.byteOffset, category, hand, item, previousItem, readiness }]
            : [];
    });
});

const equipmentCategory = computed(() => {
    const categories = equipmentChanges.value.flatMap(change => change.category ? [change.category] : []);
    return [...new Set(categories)].join(', ') || null;
});

function getFieldText(value: TLogFieldValue | undefined): string {
    return typeof value === 'string' ? value.trim() : '';
}

const originCategoryLabel = computed<string | null>(() => {
    const rawCat = props.entry.fields.category;
    if (equipmentCategory.value || typeof rawCat !== 'string' || !rawCat || rawCat === props.category) {
        return null;
    }

    return getLogOriginCategoryLabel(rawCat);
});

const title = computed(() => getLogEntryTitle(props.entry, LOGS_ADMIN.unparsedTitle));

const participants = computed(() => {
    const { event, fields } = props.entry;
    const action = props.relatedEntries.find(entry => entry.event === 'combat.action.resolved');
    const declaration = props.relatedEntries.find(entry => entry.event === 'combat.attack.started');
    const actor = getFieldText(fields.actor) || getFieldText(action?.fields.actor) || getFieldText(declaration?.fields.actor);
    let target = getFieldText(fields.target);
    if (!target && normalizeLogEventCode(event) === 'combat.attack.resolved') {
        const targetId = getFieldText(fields.target_uuid);
        const declaredTargetId = getFieldText(declaration?.fields.target_uuid);
        const sameTarget = !targetId || !declaredTargetId || targetId === declaredTargetId;
        target = (sameTarget ? getFieldText(declaration?.fields.target) : '') || targetId;
    }

    const result: Array<{ key: string; label: string; value: string }> = [];
    const pairs: ReadonlyArray<[string, string, string]> = [
        ['player', 'Игрок', getFieldText(fields.player)],
        ['actor', 'Инициатор', actor],
        ['target', 'Цель', target],
    ];

    for (const [key, label, value] of pairs) {
        if (value) {
            result.push({ key, label, value });
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

const checkMetrics = computed(() => {
    const f = props.entry.fields;
    const items: Array<{ label: string; value: string; emphasized?: boolean }> = [];
    const metricDefs: ReadonlyArray<[key: string, label: string, emphasized?: boolean]> = [
        ['roll', 'Кубик'],
        ['param', 'Параметр'],
        ['skill', 'Навык'],
        ['modifier', 'Модификатор'],
        ['bonus', 'Бонус'],
        ['result', 'Итог', true],
        ['total', 'Итог', true],
        ['difficulty', 'Сложность', true],
    ];

    const seenLabels = new Set<string>();
    for (const [key, label, emphasized] of metricDefs) {
        const val = f[key];
        if (val !== undefined && val !== null && !seenLabels.has(label)) {
            seenLabels.add(label);
            items.push({ label, value: String(val), emphasized });
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

const attackSummary = computed(() => {
    const { event, fields } = props.entry;
    if (normalizeLogEventCode(event) !== 'combat.attack.resolved') {
        return null;
    }

    const hit = typeof fields.hit === 'boolean' ? fields.hit : null;
    const bodyPart = typeof fields.body_part === 'string' ? fields.body_part.trim() : '';
    const weapon = typeof fields.weapon === 'string' ? formatLogFieldValue(fields.weapon, 'weapon') : '';
    return hit !== null || bodyPart || weapon ? { hit, bodyPart, weapon } : null;
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
    const fields = { ...props.entry.fields };
    if (equipmentChanges.value.length > 1 && equipmentCategory.value) {
        fields.category = equipmentCategory.value;
        const readiness = equipmentChanges.value
            .flatMap(change => change.category && change.readiness ? [`${change.category}: ${change.readiness}`] : [])
            .join(' · ');
        if (readiness) {
            fields.readiness = readiness;
        }
    }

    return Object.entries(fields).map(([key, value]) => {
        const isEquipmentCategory = key === 'category' && Boolean(equipmentCategory.value);

        return {
            key,
            label: isEquipmentCategory ? 'Категория снаряжения (category)' : getLogFieldLabel(key),
            value: formatLogFieldValue(value, key),
            isMultiline: key === 'stack' || key === 'details' || (typeof value === 'string' && value.includes('\n')),
            isTechnical: !isEquipmentCategory && isTechnicalLogField(key),
        };
    });
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

const rawLines = computed(() => {
    return [
        { title: LOGS_ADMIN.rawLineTitle, entry: props.entry },
        ...props.relatedEntries.map(entry => ({
            title: entry.event === 'combat.action.resolved'
                ? LOGS_ADMIN.relatedActionRawTitle
                : getLogEntryTitle(entry, LOGS_ADMIN.unparsedTitle),
            entry,
        })),
    ];
});

async function onCopyRaw(raw: string) {
    try {
        await navigator.clipboard.writeText(raw);
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

                <VBadge
                    v-if="originCategoryLabel"
                    :color="EBadgeColor.Info"
                    :size="ESize.Small"
                >
                    {{ originCategoryLabel }}
                </VBadge>

                <VBadge
                    v-if="roundBadge && !compact"
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
                :key="person.key"
                :class="$style.participant"
            >
                <span :class="$style.participantLabel">{{ person.label }}:</span>
                <span :class="[$style.participantValue, { [$style._bold]: isEquipmentChange && person.key === 'actor' }]">
                    {{ person.value }}
                </span>
            </span>
        </div>

        <ul v-if="equipmentChanges.length" :class="$style.equipmentChanges">
            <li
                v-for="change in equipmentChanges"
                :key="change.offset"
                :class="$style.equipmentChange"
            >
                <strong v-if="change.hand || change.category" :class="$style.equipmentSlot">
                    {{ change.hand || change.category }}
                </strong>

                <div v-if="change.item || change.previousItem" :class="$style.equipmentItems">
                    <div :class="$style.equipmentBefore">
                        <div :class="$style.equipmentItem">
                            <span :class="$style.equipmentCaption">Было</span>
                            <strong>{{ change.previousItem || 'пусто' }}</strong>
                        </div>
                        <VIcon
                            name="arrow-right"
                            :size="14"
                            :class="$style.equipmentArrow"
                            aria-hidden="true"
                        />
                    </div>
                    <div :class="$style.equipmentItem">
                        <span :class="$style.equipmentCaption">Стало</span>
                        <strong>{{ change.item || 'пусто' }}</strong>
                    </div>
                </div>

                <div v-if="change.readiness" :class="$style.equipmentReadiness">
                    <span :class="$style.equipmentCaption">Готовность</span>
                    <VBadge
                        :color="equipmentReadinessColors.get(change.readiness) ?? EBadgeColor.Neutral"
                        :size="ESize.Small"
                    >
                        {{ change.readiness }}
                    </VBadge>
                </div>
            </li>
        </ul>

        <div v-if="attackSummary" :class="$style.combatInfo">
            <VBadge
                v-if="attackSummary.hit !== null"
                :color="attackSummary.hit ? EBadgeColor.Success : EBadgeColor.Danger"
                :size="ESize.Small"
            >
                {{ attackSummary.hit ? 'Попадание' : 'Промах' }}
            </VBadge>

            <span v-if="attackSummary.bodyPart" :class="$style.metricItem">
                <span :class="$style.metricLabel">Часть тела:</span>
                <span :class="$style.metricValue">{{ attackSummary.bodyPart }}</span>
            </span>

            <span v-if="attackSummary.weapon" :class="$style.metricItem">
                <span :class="$style.metricLabel">Оружие:</span>
                <span :class="$style.metricValue">{{ attackSummary.weapon }}</span>
            </span>
        </div>

        <div v-if="isCheckEntry && !compact" :class="$style.summaryBox">
            <div :class="$style.summaryMain">
                <VBadge :color="checkOutcomeBadgeColor" :size="ESize.Small">
                    {{ checkOutcomeTitle }}
                </VBadge>

                <div v-if="checkMetrics.length" :class="$style.metrics">
                    <span
                        v-for="metric in checkMetrics"
                        :key="metric.label"
                        :class="[$style.metricItem, { [$style._emphasized]: metric.emphasized }]"
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
            v-if="!compact && category !== ELogCategory.Checks && (combatMetrics.length || showOpenCombatButton)"
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

        <div v-if="errorReasonSummary && !compact" :class="[$style.reasonBox, $style[`--color-${levelBadgeColor}`]]">
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
                :aria-expanded="isDetailsOpen"
                data-test="log-entry-details"
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

            <div
                v-for="line in rawLines"
                :key="line.entry.byteOffset"
                :class="$style.rawSection"
            >
                <div :class="$style.rawHeader">
                    <span :class="$style.rawTitle">{{ line.title }}</span>

                    <VButton
                        :size="ESize.Small"
                        :color="EColor.Secondary"
                        icon="copy"
                        @click="onCopyRaw(line.entry.raw)"
                    >
                        {{ LOGS_ADMIN.copyRawButton }}
                    </VButton>
                </div>

                <pre :class="$style.codeBlock">{{ line.entry.raw }}</pre>
            </div>
        </div>
    </article>
</template>

<style module lang="scss">
.LogsAdminEntryCard._compact {
    gap: $space-8;
    padding: $space-8 $space-12;
}

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
    overflow-wrap: anywhere;

    &._bold {
        font-weight: $fw-bold;
    }
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

.metricItem._emphasized {
    padding: $space-2 $space-8;
    border-radius: $radius-4;
    background-color: $surface-sunken;

    .metricLabel,
    .metricValue {
        color: $text-primary;
        font-weight: $fw-bold;
    }
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

.equipmentChanges {
    max-width: rem(760);
    border: 1px solid $border-subtle;
    border-radius: $radius-8;
    background-color: $surface;
}

.equipmentChange {
    @include t3;

    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 3fr) minmax(0, 1fr);
    gap: $space-8 $space-16;
    align-items: center;
    padding: $space-10 $space-12;
    overflow-wrap: anywhere;

    & + & {
        border-top: 1px solid $border-subtle;
    }

    @include respond-to(mobile) {
        grid-template-columns: minmax(0, 1fr) auto;
        align-items: start;
    }
}

.equipmentItem,
.equipmentReadiness {
    display: flex;
    flex-direction: column;
}

.equipmentSlot::first-letter {
    text-transform: uppercase;
}

.equipmentItems {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-column: 2;
    gap: $space-8;
    align-items: center;

    @include respond-to(mobile) {
        grid-row: 2;
        grid-column: 1 / -1;
    }
}

.equipmentBefore {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(max-content, 1fr);
    gap: $space-8;
    align-items: center;
}

.equipmentCaption {
    @include t4;

    color: $text-secondary;
}

.equipmentArrow {
    justify-self: center;
    color: $text-secondary;
}

.equipmentReadiness {
    grid-column: 3;
    gap: $space-2;
    align-items: flex-start;

    @include respond-to(mobile) {
        grid-row: 1;
        grid-column: 2;
    }
}

.reasonBox {
    @include t3;

    padding: $space-8 $space-12;
    border-radius: $radius-8;
    overflow-wrap: anywhere;

    @include badge-colors;
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
