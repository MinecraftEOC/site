<script setup lang="ts">
import type { ILogEntryItem } from '~~/shared/@types/logging';

import {
    ECONOMY_FLOW_LABELS,
    ECONOMY_OPERATION_LABELS,
} from '~~/shared/constants/economy';
import { ELogCategory } from '~~/shared/enums/logging';
import { LOGS_ECONOMY } from '~/assets/ts/constants/content/account';

import LogsAdminEconomyMoney from './LogsAdminEconomyMoney.vue';
import LogsAdminEntryCard from './LogsAdminEntryCard.vue';

interface IProps {
    /** Parsed economy log entry with its original fields. */
    entry: ILogEntryItem;
    /** Source log filename used in the raw entry details. */
    fileName: string;
}

const props = defineProps<IProps>();

const style = useCssModule();

const amount = computed(() => getEconomyNumber(props.entry.fields.amount));

const delta = computed(() =>
    getEconomyNumber(props.entry.fields.signed_amount),
);

const operation = computed(() =>
    getEconomyText(props.entry.fields.operation_type),
);

const flow = computed(() => getEconomyText(props.entry.fields.flow_kind));

const operationTitle = computed(() => {
    return (
        ECONOMY_OPERATION_LABELS[operation.value]
        ?? (operation.value || LOGS_ECONOMY.entry.unknownOperation)
    );
});

const flowTitle = computed(() => {
    return (
        ECONOMY_FLOW_LABELS[flow.value]
        ?? (flow.value || LOGS_ECONOMY.entry.missingFlow)
    );
});

const actor = computed(() => {
    return (
        getEconomyText(props.entry.fields.actor)
        || getEconomyText(props.entry.fields.actor_uuid)
    );
});

const actorLabel = computed(() => {
    const isCouncilPayment
        = operation.value === 'council_salary'
            || operation.value === 'council_prize';

    return isCouncilPayment
        ? LOGS_ECONOMY.entry.councilMemberLabel
        : LOGS_ECONOMY.entry.actorLabel;
});

const owner = computed(() => {
    return (
        getEconomyText(props.entry.fields.owner_name)
        || getEconomyText(props.entry.fields.owner_id)
    );
});

const changeClassList = computed(() => {
    if (delta.value === null || delta.value === 0) {
        return '';
    }

    return delta.value > 0 ? style.positive : style.negative;
});

const invalid = computed(() => {
    return (
        props.entry.parseError
        || amount.value === null
        || delta.value === null
        || !operation.value
        || !flow.value
    );
});
</script>

<template>
    <details :class="$style.entry" data-test="economy-entry">
        <summary :class="$style.row">
            <div :class="$style.time">
                <time :datetime="entry.timestamp ?? undefined">
                    {{ formatLogTimestamp(entry.timestamp) }}
                </time>

                <span>
                    {{ LOGS_ECONOMY.entry.sessionPrefix }}
                    {{
                        entry.fields.session_index
                            ?? LOGS_ECONOMY.entry.missingSession
                    }}
                </span>
            </div>

            <div :class="$style.operation">
                <strong>{{ operationTitle }}</strong>

                <span>{{ flowTitle }}</span>

                <span v-if="actor">{{ actorLabel }}: {{ actor }}</span>

                <span v-else-if="owner">{{ LOGS_ECONOMY.entry.ownerLabel }}: {{ owner }}</span>

                <span v-if="entry.fields.account">
                    {{ LOGS_ECONOMY.entry.accountPrefix }}
                    {{ entry.fields.account }}
                </span>

                <span v-else>{{ getEconomyParty(entry, "from") }} →
                    {{ getEconomyParty(entry, "to") }}</span>
            </div>

            <div :class="$style.money">
                <span>{{ LOGS_ECONOMY.entry.amountLabel }}</span>

                <strong>
                    <LogsAdminEconomyMoney :value="amount" />
                </strong>

                <span>
                    <LogsAdminEconomyMoney :value="amount" mode="coins" />
                </span>
            </div>

            <div :class="[$style.money, changeClassList]">
                <span>{{ LOGS_ECONOMY.entry.moneyMassLabel }}</span>

                <strong v-if="delta === 0">{{ LOGS_ECONOMY.entry.unchanged }}</strong>

                <strong v-else>
                    <LogsAdminEconomyMoney :value="delta" signed />
                </strong>

                <span :class="$style.detailsHint">{{ LOGS_ECONOMY.entry.details }}</span>
            </div>
        </summary>

        <div :class="$style.details">
            <p v-if="invalid" :class="$style.warning">
                {{ LOGS_ECONOMY.entry.invalidNotice }}
            </p>

            <p v-if="flow === 'manual_adjustment'">
                {{ LOGS_ECONOMY.entry.adjustmentNotice }}
                <LogsAdminEconomyMoney
                    :value="getEconomyNumber(entry.fields.balance_before)"
                />
                →
                <LogsAdminEconomyMoney
                    :value="getEconomyNumber(entry.fields.balance_after)"
                />
                .
            </p>

            <p>
                {{ LOGS_ECONOMY.entry.afterOperation }}
                <LogsAdminEconomyMoney
                    :value="getEconomyNumber(entry.fields.total_money)"
                />
                ,
                {{ LOGS_ECONOMY.entry.bankTotal }}
                <LogsAdminEconomyMoney
                    :value="getEconomyNumber(entry.fields.bank_total)"
                />
                ,
                {{ LOGS_ECONOMY.entry.cashTotal }}
                <LogsAdminEconomyMoney
                    :value="getEconomyNumber(entry.fields.cash_total)"
                />
                .
            </p>

            <LogsAdminEntryCard
                :entry="entry"
                :category="ELogCategory.Economy"
                :file-name="fileName"
                nested
            />
        </div>
    </details>
</template>

<style module lang="scss">
.entry {
    border: 1px solid $border-subtle;
    border-radius: $radius-8;
    background: $surface-raised;
}

.row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 2fr) minmax(0, 1fr) minmax(
        0,
        1fr
    );
    gap: $space-16;
    align-items: start;
    padding: $space-16;
    cursor: pointer;

    &:focus-visible {
        outline: 2px solid $border-focus;
        outline-offset: 2px;
    }

    @include respond-to(mobile) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}

.time,
.operation,
.money {
    @include t3;

    display: flex;
    flex-direction: column;
    gap: $space-4;
    min-width: 0;
    overflow-wrap: anywhere;

    > span {
        color: $text-secondary;
    }
}

.time {
    @include t4;
}

.money strong {
    @include mono;
}

.positive {
    color: $text-success;
}

.negative,
.warning {
    color: $text-danger;
}

.details {
    display: flex;
    flex-direction: column;
    gap: $space-12;
    padding: $space-16;
    border-top: 1px solid $border-subtle;
}

.detailsHint {
    @include t4;
}
</style>
