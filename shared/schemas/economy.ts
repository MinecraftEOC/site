import { z } from 'zod';

import { ECONOMY_FILTER_MAX_LENGTH, ECONOMY_FLOW_KINDS } from '~~/shared/constants/economy';
import { hasControlCharacters, isSafeLogToken } from '~~/shared/constants/logging';

const money = z.number().finite().int().safe();
const nonnegative = money.nonnegative();
const positive = money.positive();
const timestamp = z.string().datetime({ offset: true });
const aggregate = z.object({ count: nonnegative, amount: nonnegative });
const operationTotals = z.record(z.string(), aggregate);
const period = z.object({
    emission_total: nonnegative,
    sink_total: nonnegative,
    net_change: money,
    cash_to_bank_total: nonnegative,
    bank_to_cash_total: nonnegative,
    transfer_total: nonnegative,
    manual_adjustment_net: money,
    by_operation_type: operationTotals,
});

export const sharedEconomyAnalyticsSchema = z.object({
    version: z.literal(1),
    updated_at: timestamp,
    last_bank_sync_at: timestamp,
    session_index: positive,
    totals: z.object({ total_money: nonnegative, bank_total: nonnegative, cash_total: nonnegative }),
    bank: z.object({
        total: nonnegative,
        accounts_count: nonnegative,
        by_owner_type: z.record(z.string(), nonnegative),
        accounts: z.record(z.string(), z.object({
            owner_type: z.string(),
            owner_id: z.string().optional(),
            owner_name: z.string().optional(),
            balance: nonnegative,
        })),
    }),
    all_time: period,
    sessions: z.record(z.string(), period.extend({
        session_index: positive,
        started_at: timestamp,
        updated_at: timestamp,
        opening_total_money: nonnegative,
        opening_bank_total: nonnegative,
        opening_cash_total: nonnegative,
        closing_total_money: nonnegative,
        closing_bank_total: nonnegative,
        closing_cash_total: nonnegative,
        by_flow_kind: operationTotals,
    })),
});

function optionalInteger(min: number) {
    return z.preprocess(
        value => value === '' || value === undefined ? undefined : typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : value,
        money.min(min, 'Укажите целое неотрицательное число в допустимом диапазоне').optional(),
    );
}

const optionalText = z.string().trim().max(ECONOMY_FILTER_MAX_LENGTH).refine(value => !hasControlCharacters(value), 'Недопустимые символы в фильтре').optional().transform(value => value || undefined);

export const economyQueryFields = {
    flowKind: z.preprocess(value => value === '' ? undefined : value, z.enum(ECONOMY_FLOW_KINDS).optional()),
    operationType: optionalText.refine(value => !value || isSafeLogToken(value), 'Недопустимый тип операции'),
    sessionIndex: optionalInteger(1),
    actor: optionalText,
    account: optionalText.refine(value => !value || /^\d{4}$/.test(value), 'Номер счёта должен содержать четыре цифры'),
    minAmount: optionalInteger(0),
    maxAmount: optionalInteger(0),
};
