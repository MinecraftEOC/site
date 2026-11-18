<script setup lang="ts">
import type { TEconomyFilterInputs } from '~~/shared/constants/economy';
import type { ELogOrder } from '~~/shared/enums/logging';

import {
    ECONOMY_FILTER_MAX_LENGTH,
    ECONOMY_FLOW_LABELS,
    ECONOMY_OPERATION_LABELS,
} from '~~/shared/constants/economy';
import { LOGS_SEARCH_MAX_LENGTH } from '~~/shared/constants/logging';
import copperIcon from '~/assets/images/coin_copper_icon.png';
import { LOGS_ECONOMY } from '~/assets/ts/constants/content/account';
import { LOG_ORDER_ITEMS } from '~/assets/ts/constants/logs';
import { EColor, ESize } from '~/assets/ts/enums/common';

interface IProps {
    /** Validation error for the unapplied economy filters. */
    error: string;
}

defineProps<IProps>();

const emits = defineEmits<{
    apply: [];
    orderChange: [];
}>();

const filters = defineModel<TEconomyFilterInputs>('filters', {
    required: true,
});
const search = defineModel<string>('search', { required: true });
const order = defineModel<ELogOrder>('order', { required: true });

const flowItems = [
    { label: LOGS_ECONOMY.filters.allFlows, value: '' },
    ...Object.entries(ECONOMY_FLOW_LABELS).map(([value, label]) => ({
        value,
        label,
    })),
];

const operationItems = [
    { label: LOGS_ECONOMY.filters.allOperations, value: '' },
    ...Object.entries(ECONOMY_OPERATION_LABELS).map(([value, label]) => ({
        value,
        label,
    })),
];
</script>

<template>
    <form
        :class="$style.filters"
        data-test="economy-filters"
        @submit.prevent="emits('apply')"
    >
        <p :class="$style.scope">
            {{ LOGS_ECONOMY.filters.scope }}
        </p>

        <div :class="$style.grid">
            <VSelect
                v-model="filters.flowKind"
                :label="LOGS_ECONOMY.filters.flowLabel"
                :items="flowItems"
                :size="ESize.Small"
                data-test="economy-flow"
            />

            <VSelect
                v-model="filters.operationType"
                :label="LOGS_ECONOMY.filters.operationLabel"
                :items="operationItems"
                :size="ESize.Small"
                data-test="economy-operation"
            />

            <VInput
                v-model="filters.actor"
                :label="LOGS_ECONOMY.filters.actorLabel"
                :placeholder="LOGS_ECONOMY.filters.actorPlaceholder"
                :maxlength="ECONOMY_FILTER_MAX_LENGTH"
                :size="ESize.Small"
                data-test="economy-actor"
            />

            <VInput
                v-model="filters.account"
                :label="LOGS_ECONOMY.filters.accountLabel"
                :placeholder="LOGS_ECONOMY.filters.accountPlaceholder"
                inputmode="numeric"
                :maxlength="4"
                :size="ESize.Small"
                data-test="economy-account"
            />

            <VInput
                v-model="search"
                :label="LOGS_ECONOMY.filters.searchLabel"
                :placeholder="LOGS_ECONOMY.filters.searchPlaceholder"
                :maxlength="LOGS_SEARCH_MAX_LENGTH"
                :size="ESize.Small"
                icon="search"
                data-test="economy-search"
            />

            <div :class="$style.sort">
                <span>{{ LOGS_ECONOMY.filters.orderLabel }}</span>

                <VSwitcher
                    v-model="order"
                    :items="LOG_ORDER_ITEMS"
                    :size="ESize.Small"
                    @change="emits('orderChange')"
                />
            </div>
        </div>

        <details>
            <summary :class="$style.advanced">
                {{ LOGS_ECONOMY.filters.advancedLabel }}
            </summary>

            <div :class="$style.grid">
                <VInput
                    v-model="filters.sessionIndex"
                    :label="LOGS_ECONOMY.filters.sessionLabel"
                    :placeholder="LOGS_ECONOMY.filters.sessionPlaceholder"
                    inputmode="numeric"
                    :size="ESize.Small"
                    data-test="economy-session"
                />

                <div :class="$style.amountField">
                    <VInput
                        v-model="filters.minAmount"
                        :label="LOGS_ECONOMY.filters.minAmountLabel"
                        :hint="LOGS_ECONOMY.filters.amountHint"
                        :placeholder="LOGS_ECONOMY.filters.minAmountPlaceholder"
                        inputmode="numeric"
                        :size="ESize.Small"
                        data-test="economy-min"
                    />

                    <img
                        :src="copperIcon"
                        :class="$style.currencyIcon"
                        :title="LOGS_ECONOMY.money.copperTitle"
                        alt=""
                        aria-hidden="true"
                    >
                </div>

                <div :class="$style.amountField">
                    <VInput
                        v-model="filters.maxAmount"
                        :label="LOGS_ECONOMY.filters.maxAmountLabel"
                        :hint="LOGS_ECONOMY.filters.amountHint"
                        :placeholder="LOGS_ECONOMY.filters.maxAmountPlaceholder"
                        inputmode="numeric"
                        :size="ESize.Small"
                        data-test="economy-max"
                    />

                    <img
                        :src="copperIcon"
                        :class="$style.currencyIcon"
                        :title="LOGS_ECONOMY.money.copperTitle"
                        alt=""
                        aria-hidden="true"
                    >
                </div>
            </div>
        </details>

        <p
            v-if="error"
            :class="$style.error"
            role="alert"
        >
            {{ error }}
        </p>

        <div :class="$style.actions">
            <span>{{ LOGS_ECONOMY.currencyRatio }}
                {{ LOGS_ECONOMY.filters.rangeNotice }}</span>

            <VButton
                type="submit"
                :color="EColor.Primary"
                data-test="economy-apply"
            >
                {{ LOGS_ECONOMY.filters.apply }}
            </VButton>
        </div>
    </form>
</template>

<style module lang="scss">
.filters {
    display: flex;
    flex-direction: column;
    gap: $space-16;
    padding: $space-20;
    border: 1px solid $border-subtle;
    border-radius: $radius-12;
    background: $surface-raised;
}

.scope,
.actions {
    @include t3;

    color: $text-secondary;
}

.grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: $space-16;

    :global(.v-input__native) {
        width: 100%;
    }

    @include respond-to(mobile) {
        grid-template-columns: minmax(0, 1fr);
    }
}

.sort {
    @include l2;

    display: flex;
    flex-direction: column;
    gap: $space-8;
    align-items: flex-start;
}

.advanced {
    @include l2;

    margin-bottom: $space-12;
    cursor: pointer;
}

.actions {
    display: flex;
    flex-wrap: wrap;
    gap: $space-12;
    justify-content: space-between;
    align-items: center;
}

.error {
    color: $text-danger;
}

.filters .amountField {
    position: relative;

    :global(.v-input .v-input__native) {
        padding-right: $space-32;
    }
}

.currencyIcon {
    position: absolute;
    top: $space-32;
    right: $space-10;
    object-fit: contain;
    image-rendering: pixelated;
    width: rem(22);
    height: rem(22);
}
</style>
