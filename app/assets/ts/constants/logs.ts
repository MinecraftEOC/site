import type { ISwitcherItem } from '~/@types/switcher';

import {
    LOG_CHECK_OUTCOME_LABEL,
    LOG_CHECK_TYPE_LABEL,
    LOG_COMBAT_ACTION_LABEL,
    LOG_LEVEL_LABEL,
    LOG_ORDER_LABEL,
} from '~~/shared/constants/logging';
import { ELogCheckOutcome, ELogCheckType, ELogCombatAction, ELogLevel, ELogOrder } from '~~/shared/enums/logging';
import { EBadgeColor } from '~/assets/ts/enums/common';

/** Задержка перед отправкой поискового запроса по тексту и имени файла, мс. */
export const LOGS_SEARCH_DEBOUNCE_MS = 300;

/** Таймзона отображения серверных меток времени в админке. */
export const LOGS_DISPLAY_TIMEZONE = 'Asia/Novosibirsk';

/** Цвет бейджа для каждого уровня записи журнала. */
export const LOG_LEVEL_BADGE_COLOR: Record<ELogLevel, EBadgeColor> = {
    [ELogLevel.Error]: EBadgeColor.Danger,
    [ELogLevel.Warn]: EBadgeColor.Warning,
    [ELogLevel.Info]: EBadgeColor.Info,
    [ELogLevel.Debug]: EBadgeColor.Neutral,
};

/** Цвет бейджа для исхода проверки навыка. */
export const LOG_OUTCOME_BADGE_COLOR: Record<ELogCheckOutcome, EBadgeColor> = {
    [ELogCheckOutcome.Success]: EBadgeColor.Success,
    [ELogCheckOutcome.Failure]: EBadgeColor.Danger,
    [ELogCheckOutcome.Tie]: EBadgeColor.Warning,
    [ELogCheckOutcome.Value]: EBadgeColor.Info,
};

/** Варианты переключателя порядка чтения строк. */
export const LOG_ORDER_ITEMS: ISwitcherItem<ELogOrder>[] = [
    {
        label: LOG_ORDER_LABEL[ELogOrder.Desc],
        value: ELogOrder.Desc,
        icon: 'arrow-down-wide-narrow',
    },
    {
        label: LOG_ORDER_LABEL[ELogOrder.Asc],
        value: ELogOrder.Asc,
        icon: 'arrow-up-narrow-wide',
    },
];

/** Варианты фильтра по уровню записи (включая «Все уровни»). */
export const LOG_LEVEL_OPTIONS: ReadonlyArray<{ label: string; value: '' | ELogLevel }> = [
    { label: 'Все уровни', value: '' },
    { label: LOG_LEVEL_LABEL[ELogLevel.Error], value: ELogLevel.Error },
    { label: LOG_LEVEL_LABEL[ELogLevel.Warn], value: ELogLevel.Warn },
    { label: LOG_LEVEL_LABEL[ELogLevel.Info], value: ELogLevel.Info },
    { label: LOG_LEVEL_LABEL[ELogLevel.Debug], value: ELogLevel.Debug },
];

/** Варианты фильтра по типу проверки из каталога. */
export const LOG_CHECK_TYPE_OPTIONS: ReadonlyArray<{ label: string; value: '' | ELogCheckType }> = [
    { label: 'Все проверки', value: '' },
    ...Object.values(ELogCheckType).map(code => ({
        label: `${LOG_CHECK_TYPE_LABEL[code]} (${code})`,
        value: code,
    })),
];

/** Варианты фильтра по исходу проверки. */
export const LOG_OUTCOME_OPTIONS: ReadonlyArray<{ label: string; value: '' | ELogCheckOutcome }> = [
    { label: 'Все исходы', value: '' },
    { label: LOG_CHECK_OUTCOME_LABEL[ELogCheckOutcome.Success], value: ELogCheckOutcome.Success },
    { label: LOG_CHECK_OUTCOME_LABEL[ELogCheckOutcome.Failure], value: ELogCheckOutcome.Failure },
    { label: LOG_CHECK_OUTCOME_LABEL[ELogCheckOutcome.Tie], value: ELogCheckOutcome.Tie },
    { label: LOG_CHECK_OUTCOME_LABEL[ELogCheckOutcome.Value], value: ELogCheckOutcome.Value },
];

/** Варианты фильтра по действию в бою (`fields.action` в `combat.*`). */
export const LOG_COMBAT_ACTION_OPTIONS: ReadonlyArray<{ label: string; value: '' | ELogCombatAction }> = [
    { label: 'Все действия', value: '' },
    { label: LOG_COMBAT_ACTION_LABEL[ELogCombatAction.Attack], value: ELogCombatAction.Attack },
    { label: LOG_COMBAT_ACTION_LABEL[ELogCombatAction.EquipmentChange], value: ELogCombatAction.EquipmentChange },
    { label: LOG_COMBAT_ACTION_LABEL[ELogCombatAction.FullDefense], value: ELogCombatAction.FullDefense },
    { label: LOG_COMBAT_ACTION_LABEL[ELogCombatAction.Potion], value: ELogCombatAction.Potion },
    { label: LOG_COMBAT_ACTION_LABEL[ELogCombatAction.None], value: ELogCombatAction.None },
];
