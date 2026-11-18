<script setup lang="ts">
import type { IEconomyAnalytics } from '~~/shared/@types/economy';

import {
    ECONOMY_FLOW_LABELS,
    ECONOMY_METRIC_LABELS,
    ECONOMY_OPERATION_LABELS,
    ECONOMY_OWNER_LABELS,
} from '~~/shared/constants/economy';
import { LOGS_ECONOMY } from '~/assets/ts/constants/content/account';
import { EColor, ESize } from '~/assets/ts/enums/common';

import LogsAdminEconomyMoney from './LogsAdminEconomyMoney.vue';

interface IProps {
    /** Validated economy snapshot, or null when unavailable. */
    analytics: IEconomyAnalytics | null;
    /** Whether the economy snapshot is being loaded. */
    loading: boolean;
    /** User-facing snapshot loading error. */
    error: string;
}

const props = defineProps<IProps>();

const emits = defineEmits<{
    retry: [];
}>();

const OPERATIONS_PAGE_SIZE = 12;

const accountSearch = ref('');
const selectedPeriod = ref('all');
const operationsPage = ref(1);

const totals = computed(() => {
    if (!props.analytics) {
        return [];
    }

    return [
        {
            label: LOGS_ECONOMY.overview.totalMoney,
            value: props.analytics.totals.total_money,
            icon: 'coins',
        },
        {
            label: LOGS_ECONOMY.overview.bankTotal,
            value: props.analytics.totals.bank_total,
            icon: 'landmark',
        },
        {
            label: LOGS_ECONOMY.overview.cashTotal,
            value: props.analytics.totals.cash_total,
            icon: 'wallet',
        },
    ];
});

const sessions = computed(() => {
    return Object.values(props.analytics?.sessions ?? {}).sort(
        (a, b) => b.session_index - a.session_index,
    );
});

const periodItems = computed(() => [
    {
        value: 'all',
        label: LOGS_ECONOMY.overview.allTime,
    },
    ...sessions.value.map(session => ({
        value: String(session.session_index),
        label: `${LOGS_ECONOMY.overview.sessionPrefix} ${session.session_index}`,
    })),
]);

const session = computed(() => {
    return selectedPeriod.value === 'all'
        ? null
        : (props.analytics?.sessions[selectedPeriod.value] ?? null);
});

const period = computed(
    () => session.value ?? props.analytics?.all_time ?? null,
);

const metrics = computed(() => {
    return Object.entries(ECONOMY_METRIC_LABELS).map(([key, label]) => ({
        key,
        label,
        value: period.value?.[key as keyof IEconomyAnalytics['all_time']],
    }));
});

const operations = computed(() => {
    return Object.entries(period.value?.by_operation_type ?? {}).sort(
        ([, a], [, b]) => b.amount - a.amount,
    );
});

const operationsPagesCount = computed(() => {
    return Math.max(
        1,
        Math.ceil(operations.value.length / OPERATIONS_PAGE_SIZE),
    );
});

const paginatedOperations = computed(() => {
    const start = (operationsPage.value - 1) * OPERATIONS_PAGE_SIZE;

    return operations.value.slice(start, start + OPERATIONS_PAGE_SIZE);
});

const accounts = computed(() => {
    const search = accountSearch.value.trim().toLowerCase();

    return Object.entries(props.analytics?.bank.accounts ?? {})
        .filter(([number, account]) => {
            if (!search) {
                return true;
            }

            const terms = [
                number,
                account.owner_name,
                account.owner_id,
                ECONOMY_OWNER_LABELS[account.owner_type] ?? account.owner_type,
            ];

            return terms.some(value => value?.toLowerCase().includes(search));
        })
        .sort(([, a], [, b]) => b.balance - a.balance);
});

const ownerTotals = computed(() =>
    Object.entries(props.analytics?.bank.by_owner_type ?? {}),
);

watch(selectedPeriod, () => {
    operationsPage.value = 1;
});

watch(operationsPagesCount, (pagesCount) => {
    operationsPage.value = Math.min(operationsPage.value, pagesCount);
});

watch(
    () => props.analytics,
    (analytics) => {
        if (
            selectedPeriod.value !== 'all'
            && !analytics?.sessions[selectedPeriod.value]
        ) {
            selectedPeriod.value = 'all';
        }
    },
);
</script>

<template>
    <section
        :class="$style.overview"
        data-test="economy-overview"
        :aria-label="LOGS_ECONOMY.overview.title"
    >
        <div :class="$style.heading">
            <div>
                <h2 :class="$style.title">
                    {{ LOGS_ECONOMY.overview.title }}
                </h2>

                <p :class="$style.caption">
                    {{ LOGS_ECONOMY.overview.description }}
                </p>
            </div>

            <VButton
                v-if="error"
                :size="ESize.Small"
                :color="EColor.Secondary"
                @click="emits('retry')"
            >
                {{ LOGS_ECONOMY.overview.retry }}
            </VButton>
        </div>

        <p v-if="loading" role="status">
            {{ LOGS_ECONOMY.overview.loading }}
        </p>

        <p
            v-else-if="error"
            :class="$style.warning"
            role="alert"
        >
            {{ error }}. {{ LOGS_ECONOMY.overview.errorNotice }}
        </p>

        <template v-if="analytics && !loading">
            <div :class="$style.totals">
                <div
                    v-for="total in totals"
                    :key="total.label"
                    :class="$style.total"
                >
                    <span :class="$style.totalLabel">
                        <VIcon :name="total.icon" :size="18" />
                        {{ total.label }}
                    </span>

                    <strong>
                        <LogsAdminEconomyMoney :value="total.value" />
                    </strong>

                    <span>
                        <LogsAdminEconomyMoney
                            :value="total.value"
                            mode="coins"
                        />
                    </span>
                </div>
            </div>

            <p :class="$style.caption">
                {{ LOGS_ECONOMY.overview.updatedAt }}:
                {{ formatLogTimestamp(analytics.updated_at) }} ·
                {{ LOGS_ECONOMY.overview.bankSyncedAt }}:
                {{ formatLogTimestamp(analytics.last_bank_sync_at) }} ·
                {{ LOGS_ECONOMY.overview.currentSession }}:
                {{ analytics.session_index }}.
                {{ LOGS_ECONOMY.overview.cashNotice }}
                {{ LOGS_ECONOMY.currencyRatio }}
            </p>

            <details :class="$style.section">
                <summary>{{ LOGS_ECONOMY.overview.movementTitle }}</summary>

                <div :class="$style.sectionBody">
                    <VSelect
                        v-model="selectedPeriod"
                        :label="LOGS_ECONOMY.overview.periodLabel"
                        :items="periodItems"
                        :size="ESize.Small"
                        data-test="economy-period"
                    />

                    <div v-if="session" :class="$style.caption">
                        <p>
                            {{ formatLogTimestamp(session.started_at) }} —
                            {{ formatLogTimestamp(session.updated_at) }}
                        </p>

                        <p>
                            {{ LOGS_ECONOMY.overview.moneyMass }}:
                            <LogsAdminEconomyMoney
                                :value="session.opening_total_money"
                            />
                            →
                            <LogsAdminEconomyMoney
                                :value="session.closing_total_money"
                            />
                        </p>

                        <p>
                            {{ LOGS_ECONOMY.overview.bank }}:
                            <LogsAdminEconomyMoney
                                :value="session.opening_bank_total"
                            />
                            →
                            <LogsAdminEconomyMoney
                                :value="session.closing_bank_total"
                            />
                        </p>

                        <p>
                            {{ LOGS_ECONOMY.overview.cash }}:
                            <LogsAdminEconomyMoney
                                :value="session.opening_cash_total"
                            />
                            →
                            <LogsAdminEconomyMoney
                                :value="session.closing_cash_total"
                            />
                        </p>
                    </div>

                    <div :class="$style.metrics">
                        <div
                            v-for="metric in metrics"
                            :key="metric.key"
                            :class="$style.metric"
                        >
                            <span>{{ metric.label }}</span>

                            <strong>
                                <LogsAdminEconomyMoney
                                    :value="
                                        typeof metric.value === 'number'
                                            ? metric.value
                                            : null
                                    "
                                    :signed="
                                        metric.key === 'net_change'
                                            || metric.key === 'manual_adjustment_net'
                                    "
                                />
                            </strong>
                        </div>
                    </div>

                    <p :class="$style.caption">
                        {{ LOGS_ECONOMY.overview.turnoverNotice }}
                    </p>

                    <div v-if="session" :class="$style.tableScroll">
                        <table :class="$style.table">
                            <caption>
                                {{ LOGS_ECONOMY.overview.sessionFlowsTitle }}
                            </caption>

                            <thead>
                                <tr>
                                    <th scope="col">
                                        {{ LOGS_ECONOMY.overview.flowColumn }}
                                    </th>

                                    <th scope="col">
                                        {{ LOGS_ECONOMY.overview.operationsColumn }}
                                    </th>

                                    <th scope="col">
                                        {{ LOGS_ECONOMY.overview.turnoverColumn }}
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                <tr
                                    v-for="(aggregate, kind) in session.by_flow_kind"
                                    :key="kind"
                                >
                                    <td>
                                        {{ ECONOMY_FLOW_LABELS[kind] ?? kind }}
                                    </td>

                                    <td>{{ aggregate.count }}</td>

                                    <td>
                                        <LogsAdminEconomyMoney
                                            :value="aggregate.amount"
                                        />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div :class="$style.tableScroll">
                        <table
                            :class="$style.table"
                            data-test="economy-operations-table"
                        >
                            <caption>
                                {{ LOGS_ECONOMY.overview.operationsTitle }}
                            </caption>

                            <thead>
                                <tr>
                                    <th scope="col">
                                        {{ LOGS_ECONOMY.overview.operationColumn }}
                                    </th>

                                    <th scope="col">
                                        {{ LOGS_ECONOMY.overview.countColumn }}
                                    </th>

                                    <th scope="col">
                                        {{ LOGS_ECONOMY.overview.turnoverColumn }}
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                <tr
                                    v-for="[operation, aggregate] in paginatedOperations"
                                    :key="operation"
                                >
                                    <td>
                                        {{
                                            ECONOMY_OPERATION_LABELS[
                                                operation
                                            ] ?? operation
                                        }}
                                    </td>

                                    <td>{{ aggregate.count }}</td>

                                    <td>
                                        <LogsAdminEconomyMoney
                                            :value="aggregate.amount"
                                        />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <VPagination
                        v-if="operationsPagesCount > 1"
                        :can-go-prev="operationsPage > 1"
                        :can-go-next="operationsPage < operationsPagesCount"
                        :label="LOGS_ECONOMY.overview.paginationLabel"
                        data-test="economy-operations-pagination"
                        @prev="operationsPage -= 1"
                        @next="operationsPage += 1"
                    >
                        {{
                            LOGS_ECONOMY.overview.pageLabel(
                                operationsPage,
                                operationsPagesCount,
                            )
                        }}
                    </VPagination>
                </div>
            </details>

            <details :class="$style.section">
                <summary>
                    {{ LOGS_ECONOMY.overview.bankAccountsTitle }} ·
                    {{ analytics.bank.accounts_count }}
                </summary>

                <div :class="$style.sectionBody">
                    <div :class="$style.metrics">
                        <div
                            v-for="[ownerType, amount] in ownerTotals"
                            :key="ownerType"
                            :class="$style.metric"
                        >
                            <span>{{
                                ECONOMY_OWNER_LABELS[ownerType] ?? ownerType
                            }}</span>

                            <strong>
                                <LogsAdminEconomyMoney :value="amount" />
                            </strong>
                        </div>
                    </div>

                    <VInput
                        v-model="accountSearch"
                        :label="LOGS_ECONOMY.overview.accountSearchLabel"
                        :placeholder="LOGS_ECONOMY.overview.accountSearchPlaceholder"
                        icon="search"
                        :size="ESize.Small"
                        data-test="economy-bank-search"
                    />

                    <p v-if="!accounts.length" :class="$style.caption">
                        {{ LOGS_ECONOMY.overview.accountsEmpty }}
                    </p>

                    <div v-else :class="$style.tableScroll">
                        <table :class="$style.table">
                            <caption>
                                {{ LOGS_ECONOMY.overview.accountsCaption }}
                            </caption>

                            <thead>
                                <tr>
                                    <th scope="col">
                                        {{ LOGS_ECONOMY.overview.accountColumn }}
                                    </th>

                                    <th scope="col">
                                        {{ LOGS_ECONOMY.overview.ownerColumn }}
                                    </th>

                                    <th scope="col">
                                        {{ LOGS_ECONOMY.overview.balanceColumn }}
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                <tr
                                    v-for="[number, account] in accounts"
                                    :key="number"
                                >
                                    <td :class="$style.number">
                                        {{ number }}
                                    </td>

                                    <td>
                                        {{
                                            ECONOMY_OWNER_LABELS[
                                                account.owner_type
                                            ] ?? account.owner_type
                                        }}
                                        <span
                                            v-if="
                                                account.owner_name
                                                    || account.owner_id
                                            "
                                        >
                                            ·
                                            {{
                                                account.owner_name
                                                    || account.owner_id
                                            }}
                                        </span>
                                    </td>

                                    <td :class="$style.number">
                                        <LogsAdminEconomyMoney
                                            :value="account.balance"
                                        />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </details>
        </template>
    </section>
</template>

<style module lang="scss">
.overview {
    display: flex;
    flex-direction: column;
    gap: $space-16;
    padding: $space-24;
    border: 1px solid $border-subtle;
    border-radius: $radius-12;
    background: $surface;

    @include respond-to(mobile) {
        padding: $space-16;
    }
}

.heading {
    display: flex;
    flex-wrap: wrap;
    gap: $space-12;
    justify-content: space-between;
    align-items: center;
}

.title {
    @include h3;
}

.caption {
    @include t3;

    color: $text-secondary;
}

.totals {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: $space-16;

    @include respond-to(mobile) {
        grid-template-columns: minmax(0, 1fr);
    }
}

.total {
    display: flex;
    flex-direction: column;
    gap: $space-8;
    padding: $space-16;
    border: 1px solid $border-subtle;
    border-radius: $radius-8;
    background: $surface-raised;

    strong {
        @include h4;
    }
}

.totalLabel {
    @include l2;

    display: flex;
    gap: $space-8;
    align-items: center;
}

.section {
    min-width: 0;
    padding-top: $space-12;
    border-top: 1px solid $border-subtle;

    summary {
        @include l1;

        cursor: pointer;
    }
}

.sectionBody {
    display: flex;
    flex-direction: column;
    gap: $space-16;
    padding-top: $space-16;

    :global(.v-input__native) {
        width: 100%;
    }
}

.metrics {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(rem(200), 1fr));
    gap: $space-12;
}

.metric {
    @include t3;

    display: flex;
    flex-direction: column;
    gap: $space-4;
}

.tableScroll {
    overflow-x: auto;
}

.table {
    @include t3;

    width: 100%;
    border-collapse: collapse;
    text-align: left;

    caption {
        @include l2;

        padding-bottom: $space-8;
        text-align: left;
    }

    th,
    td {
        vertical-align: top;
        padding: $space-8 $space-12;
        border-bottom: 1px solid $border-subtle;
    }
}

.number {
    @include mono;

    white-space: nowrap;
}

.warning {
    color: $text-danger;
}
</style>
