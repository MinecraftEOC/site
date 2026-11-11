<script setup lang="ts">
import type { ELogCheckOutcome, ELogCheckType, ELogCombatAction, ELogLevel } from '~~/shared/enums/logging';
import type { ITagItem } from '~/@types/tags';

import { LOGS_EVENT_MAX_LENGTH, LOGS_SEARCH_MAX_LENGTH } from '~~/shared/constants/logging';
import { ELogOrder } from '~~/shared/enums/logging';
import { LOGS_ADMIN } from '~/assets/ts/constants/content/account';
import {
    LOG_CHECK_TYPE_OPTIONS,
    LOG_COMBAT_ACTION_OPTIONS,
    LOG_LEVEL_OPTIONS,
    LOG_ORDER_ITEMS,
    LOG_OUTCOME_OPTIONS,
} from '~/assets/ts/constants/logs';
import { ESize } from '~/assets/ts/enums/common';

interface IProps {
    /** Показывать ли дополнительные фильтры проверок навыков (`checkType`, `outcome`) */
    isChecksCategory?: boolean;
    /** Показывать ли фильтр боевых действий (`action`) для категории `combat` */
    isCombatCategory?: boolean;
}

withDefaults(defineProps<IProps>(), {
    isChecksCategory: false,
    isCombatCategory: false,
});

const emits = defineEmits<{
    change: [];
}>();

const search = defineModel<string>('search', { default: '' });
const event = defineModel<string>('event', { default: '' });
const level = defineModel<'' | ELogLevel>('level', { default: '' });
const order = defineModel<ELogOrder>('order', { default: ELogOrder.Desc });
const checkType = defineModel<'' | ELogCheckType>('checkType', { default: '' });
const outcome = defineModel<'' | ELogCheckOutcome>('outcome', { default: '' });
const action = defineModel<'' | ELogCombatAction>('action', { default: '' });

const levelTagItems = computed<ITagItem[]>(() => LOG_LEVEL_OPTIONS.map(opt => ({
    label: opt.label,
    value: opt.value,
})));

function onLevelTagChange(val: string | string[] | null): void {
    level.value = typeof val === 'string' ? (val as '' | ELogLevel) : '';
    emits('change');
}
</script>

<template>
    <div :class="$style.LogsAdminFilters">
        <div :class="$style.topRow">
            <VInput
                v-model="search"
                icon="search"
                :label="LOGS_ADMIN.searchLabel"
                :maxlength="LOGS_SEARCH_MAX_LENGTH"
                :placeholder="LOGS_ADMIN.searchPlaceholder"
                :class="$style.searchField"
            />

            <VInput
                v-model="event"
                icon="terminal"
                :label="LOGS_ADMIN.eventLabel"
                :maxlength="LOGS_EVENT_MAX_LENGTH"
                :placeholder="LOGS_ADMIN.eventPlaceholder"
                :class="$style.eventField"
            />

            <div :class="$style.orderField">
                <span :class="$style.label">{{ LOGS_ADMIN.orderLabel }}</span>
                <VSwitcher
                    v-model="order"
                    :items="LOG_ORDER_ITEMS"
                    :size="ESize.Small"
                    @change="emits('change')"
                />
            </div>
        </div>

        <div :class="$style.secondRow">
            <div :class="$style.levelGroup">
                <span :class="$style.label">{{ LOGS_ADMIN.levelLabel }}</span>
                <VTags
                    :model-value="level"
                    :items="levelTagItems"
                    :size="ESize.Small"
                    @change="onLevelTagChange"
                />
            </div>

            <div v-if="isChecksCategory" :class="$style.checksSelects">
                <VSelect
                    v-model="checkType"
                    :label="LOGS_ADMIN.checkTypeLabel"
                    :items="LOG_CHECK_TYPE_OPTIONS"
                    :size="ESize.Small"
                    :class="$style.checkTypeSelect"
                    @change="emits('change')"
                />

                <VSelect
                    v-model="outcome"
                    :label="LOGS_ADMIN.outcomeLabel"
                    :items="LOG_OUTCOME_OPTIONS"
                    :size="ESize.Small"
                    :class="$style.outcomeSelect"
                    @change="emits('change')"
                />
            </div>

            <div v-if="isCombatCategory" :class="$style.checksSelects">
                <VSelect
                    v-model="action"
                    :label="LOGS_ADMIN.combatActionLabel"
                    :items="LOG_COMBAT_ACTION_OPTIONS"
                    :size="ESize.Small"
                    :class="$style.combatActionSelect"
                    @change="emits('change')"
                />
            </div>
        </div>
    </div>
</template>

<style module lang="scss">
.LogsAdminFilters {
    display: flex;
    flex-direction: column;
    gap: $space-16;
    padding: $space-16 $space-20;
    border: 1px solid $border-subtle;
    border-radius: $radius-12;
    background-color: $surface-raised;
}

.topRow {
    display: flex;
    flex-wrap: wrap;
    gap: $space-16;
    justify-content: flex-start;
    align-items: flex-end;
}

.searchField {
    width: 100%;
    max-width: rem(380);

    & :global(.v-input__native) {
        width: 100%;
    }

    @include respond-to(mobile) {
        max-width: none;
    }
}

.eventField {
    width: 100%;
    max-width: rem(300);

    & :global(.v-input__native) {
        width: 100%;
    }

    @include respond-to(mobile) {
        max-width: none;
    }
}

.orderField {
    display: flex;
    flex-direction: column;
    gap: $space-8;
    margin-left: auto;

    @include respond-to(tablet) {
        margin-left: 0;
    }
}

.secondRow {
    display: flex;
    flex-wrap: wrap;
    gap: $space-16;
    justify-content: space-between;
    align-items: flex-end;
}

.levelGroup {
    display: flex;
    flex-direction: column;
    gap: $space-8;
}

.label {
    @include l2;

    color: $text-primary;
}

.checksSelects {
    display: flex;
    flex-wrap: wrap;
    gap: $space-12;
    align-items: flex-end;

    @include respond-to(mobile) {
        width: 100%;
    }
}

.checkTypeSelect {
    min-width: rem(290);

    @include respond-to(mobile) {
        width: 100%;
        min-width: 0;
    }
}

.outcomeSelect {
    min-width: rem(210);

    @include respond-to(mobile) {
        width: 100%;
        min-width: 0;
    }
}

.combatActionSelect {
    min-width: rem(230);

    @include respond-to(mobile) {
        width: 100%;
        min-width: 0;
    }
}
</style>
