import type { ILogEntryItem, TLogFieldValue } from '~~/shared/@types/logging';

import { ECONOMY_OWNER_LABELS } from '~~/shared/constants/economy';
import { LOGS_ECONOMY } from '~/assets/ts/constants/content/account';

export function getEconomyNumber(value: TLogFieldValue | undefined): number | null {
    return typeof value === 'number' && Number.isSafeInteger(value) ? value : null;
}

export function getEconomyText(value: TLogFieldValue | undefined): string {
    return typeof value === 'string' ? value : '';
}

export function getEconomyParty(entry: ILogEntryItem, side: 'from' | 'to'): string {
    const type = getEconomyText(entry.fields[`${side}_type`]);
    const account = getEconomyText(entry.fields[`${side}_account`]);
    return (
        [ECONOMY_OWNER_LABELS[type] ?? type, account ? `№ ${account}` : ''].filter(Boolean).join(' · ')
        || LOGS_ECONOMY.entry.missingParty
    );
}
