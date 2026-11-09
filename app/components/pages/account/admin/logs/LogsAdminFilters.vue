<script setup lang="ts">
import type { ELogCheckOutcome, ELogCheckType, ELogLevel } from '~~/shared/enums/logging';
import type { ITagItem } from '~/@types/tags';

import { LOGS_EVENT_MAX_LENGTH, LOGS_SEARCH_MAX_LENGTH } from '~~/shared/constants/logging';
import { ELogOrder } from '~~/shared/enums/logging';
import { LOGS_ADMIN } from '~/assets/ts/constants/content/account';
import {
    LOG_CHECK_TYPE_OPTIONS,
    LOG_LEVEL_OPTIONS,
    LOG_ORDER_ITEMS,
    LOG_OUTCOME_OPTIONS,
} from '~/assets/ts/constants/logs';
import { ESize } from '~/assets/ts/enums/common';

interface IProps {
    /** Показывать ли дополнительные фильтры проверок навыков (`checkType`, `outcome`) */
    isChecksCategory?: boolean;
}

withDefaults(defineProps<IProps>(), {
    isChecksCategory: false,
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
                <label :class="$style.selectField">
                    <span :class="$style.label">{{ LOGS_ADMIN.checkTypeLabel }}</span>
                    <select
                        v-model="checkType"
                        :class="$style.nativeSelect"
                        @change="emits('change')"
                    >
                        <option
                            v-for="opt in LOG_CHECK_TYPE_OPTIONS"
                            :key="opt.value"
                            :value="opt.value"
                        >
                            {{ opt.label }}
                        </option>
                    </select>
                </label>

                <label :class="$style.selectField">
                    <span :class="$style.label">{{ LOGS_ADMIN.outcomeLabel }}</span>
                    <select
                        v-model="outcome"
                        :class="$style.nativeSelect"
                        @change="emits('change')"
                    >
                        <option
                            v-for="opt in LOG_OUTCOME_OPTIONS"
                            :key="opt.value"
                            :value="opt.value"
                        >
                            {{ opt.label }}
                        </option>
                    </select>
                </label>
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
}

.selectField {
    display: flex;
    flex-direction: column;
    gap: $space-8;
}

.nativeSelect {
    @include t3;

    height: $space-32;
    padding: 0 $space-12;
    border: 1px solid $input-border;
    border-radius: $radius-4;
    background-color: $input-bg;
    color: $input-text;
    cursor: pointer;

    &:focus {
        border-color: $focus-ring;
        outline: none;
    }
}
</style>
