import type { ILogEntryGroup, ILogEntryItem, TLogFieldValue } from '~~/shared/@types/logging';
import type { ELogCategory, ELogCheckType, ELogCombatAction } from '~~/shared/enums/logging';

import {
    LOG_CATEGORY_LABEL,
    LOG_CHECK_OUTCOME_LABEL,
    LOG_CHECK_TYPE_LABEL,
    LOG_COMBAT_ACTION_LABEL,
    LOG_FIELD_LABELS,
    LOG_TECHNICAL_FIELD_KEYS,
} from '~~/shared/constants/logging';
import { ELogCheckOutcome } from '~~/shared/enums/logging';
import { BYTES_IN_KB } from '~/assets/ts/constants/common';
import { LOGS_DISPLAY_TIMEZONE } from '~/assets/ts/constants/logs';

const BYTES_IN_MB = BYTES_IN_KB * 1024;

const ISO_TIMESTAMP_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?$/;

const TECHNICAL_FIELD_KEY_SET = new Set<string>(LOG_TECHNICAL_FIELD_KEYS);

const logDateTimeFormatter = new Intl.DateTimeFormat('ru-RU', {
    timeZone: LOGS_DISPLAY_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
});

const fileDateTimeFormatter = new Intl.DateTimeFormat('ru-RU', {
    timeZone: LOGS_DISPLAY_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
});

/**
 * Форматирует размер файла или объём прочитанных байт в `Б`, `КБ` или `МБ`.
 *
 * @param bytes Количество байт.
 * @returns Человекочитаемая строка размера.
 */
export function formatLogBytes(bytes: number): string {
    if (!Number.isFinite(bytes) || bytes <= 0) {
        return '0 Б';
    }

    if (bytes < BYTES_IN_KB) {
        return `${bytes} Б`;
    }

    if (bytes < BYTES_IN_MB) {
        return `${(bytes / BYTES_IN_KB).toFixed(1)} КБ`;
    }

    return `${(bytes / BYTES_IN_MB).toFixed(2)} МБ`;
}

/**
 * Форматирует метку времени записи журнала в серверной таймзоне `Asia/Novosibirsk`.
 *
 * @param timestamp Оригинальная ISO-строка времени из префикса.
 * @returns Отформатированная дата и время с миллисекундами или исходная строка.
 */
export function formatLogTimestamp(timestamp: string | null): string {
    if (!timestamp) {
        return 'Время не распознано';
    }

    const parsed = new Date(timestamp);
    if (Number.isNaN(parsed.getTime())) {
        return timestamp;
    }

    return logDateTimeFormatter.format(parsed);
}

/**
 * Форматирует дату последнего изменения файла журнала.
 *
 * @param value ISO-строка даты изменения файла.
 * @returns Строка даты и времени в `Asia/Novosibirsk`.
 */
export function formatLogFileDate(value: string): string {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return value;
    }

    return fileDateTimeFormatter.format(parsed);
}

/**
 * Возвращает человекочитаемое название поля `logfmt` вместе с ключом.
 *
 * @param key Ключ поля `logfmt`.
 * @returns Подпись вида `Игрок (player)` или сам ключ.
 */
export function getLogFieldLabel(key: string): string {
    const label = LOG_FIELD_LABELS[key];
    return label ? `${label} (${key})` : key;
}

/**
 * Форматирует скалярное значение поля `logfmt` для вывода в карточке.
 * ISO-строки даты и времени автоматически переводятся в понятный человеку формат.
 *
 * @param value Значение поля.
 * @returns Текстовое представление значения.
 */
export function formatLogFieldValue(value: TLogFieldValue): string {
    if (value === null) {
        return 'не определено (null)';
    }

    if (value === true) {
        return 'да';
    }

    if (value === false) {
        return 'нет';
    }

    if (typeof value === 'string' && ISO_TIMESTAMP_REGEX.test(value)) {
        return formatLogTimestamp(value);
    }

    return String(value);
}

/**
 * Проверяет, относится ли ключ поля `logfmt` к техническим (служебным) параметрам.
 *
 * @param key Ключ поля `logfmt`.
 * @returns `true`, если поле нужно вынести в сворачиваемую техническую группу.
 */
export function isTechnicalLogField(key: string): boolean {
    return TECHNICAL_FIELD_KEY_SET.has(key);
}

/**
 * Возвращает базовый код события без суффикса `.repeated`.
 *
 * @param event Исходный код события.
 * @returns Базовый код события или `null`.
 */
export function normalizeLogEventCode(event: string | null): string | null {
    if (!event) {
        return null;
    }

    return event.replace(/\.repeated$/i, '');
}

/**
 * Возвращает человекочитаемое название категории по коду из `fields.category`.
 *
 * @param categoryCode Код категории из поля записи.
 * @returns Русское название категории или сам код.
 */
export function getLogOriginCategoryLabel(categoryCode: string): string {
    if (categoryCode in LOG_CATEGORY_LABEL) {
        return LOG_CATEGORY_LABEL[categoryCode as ELogCategory];
    }

    return categoryCode;
}

/**
 * Возвращает человекочитаемое название типа проверки или навыка.
 *
 * @param checkType Код типа проверки или навыка (`fields.check_type`, `fields.skill_key`, `fields.param_key`).
 * @returns Название проверки на русском или исходный код.
 */
export function getLogCheckTypeTitle(checkType: string): string {
    if (checkType in LOG_CHECK_TYPE_LABEL) {
        return LOG_CHECK_TYPE_LABEL[checkType as ELogCheckType];
    }

    const underscored = checkType.replace(/\./g, '_');
    if (underscored in LOG_CHECK_TYPE_LABEL) {
        return LOG_CHECK_TYPE_LABEL[underscored as ELogCheckType];
    }

    if (checkType.startsWith('combat.')) {
        const suffix = checkType.slice('combat.'.length);
        if (suffix in LOG_CHECK_TYPE_LABEL) {
            return LOG_CHECK_TYPE_LABEL[suffix as ELogCheckType];
        }
    }

    return checkType;
}

/**
 * Возвращает человекочитаемое название навыка или параметра, по которому выполняется проверка.
 *
 * @param entry Разобранная запись журнала.
 * @returns Название навыка/параметра на русском или пустая строка.
 */
function getEntryCheckedSkillTitle(entry: ILogEntryItem): string {
    const { fields } = entry;
    const rawKey = typeof fields.skill_key === 'string' && fields.skill_key.trim()
        ? fields.skill_key.trim()
        : typeof fields.param_key === 'string' && fields.param_key.trim()
            ? fields.param_key.trim()
            : typeof fields.check_type === 'string' && fields.check_type.trim()
                ? fields.check_type.trim()
                : '';

    if (!rawKey) {
        return '';
    }

    return getLogCheckTypeTitle(rawKey);
}

/**
 * Форматирует название боевого действия (`fields.action`) с заглавной буквы.
 *
 * @param rawAction Значение поля `action` из события `combat.*`.
 * @returns Человекочитаемое название действия или пустая строка.
 */
function formatCombatActionTitle(rawAction: TLogFieldValue | undefined): string {
    if (typeof rawAction !== 'string') {
        return '';
    }

    const trimmed = rawAction.trim();
    if (!trimmed) {
        return '';
    }

    const lower = trimmed.toLowerCase();
    if (lower in LOG_COMBAT_ACTION_LABEL) {
        return LOG_COMBAT_ACTION_LABEL[lower as ELogCombatAction];
    }

    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

/**
 * Возвращает заголовок карточки записи журнала по полям `check_name` + навык,
 * боевому действию и инициатору, `message` или `event`.
 *
 * @param entry Разобранная запись журнала.
 * @param fallback Заголовок для нераспознанной строки.
 * @returns Заголовок карточки.
 */
export function getLogEntryTitle(entry: ILogEntryItem, fallback: string): string {
    const checkName = typeof entry.fields.check_name === 'string' ? entry.fields.check_name.trim() : '';
    const isCheck = entry.event === 'skill.check.resolved' || Boolean(checkName) || Boolean(entry.fields.check_type);

    if (isCheck) {
        const skillTitle = getEntryCheckedSkillTitle(entry);
        const checkParts = [checkName, skillTitle].filter(Boolean);
        if (checkParts.length) {
            return checkParts.join(' · ');
        }
    }

    const message = typeof entry.fields.message === 'string' ? entry.fields.message.trim() : '';

    if (entry.event?.startsWith('combat.')) {
        const baseTitle = message || entry.event;
        const actionTitle = formatCombatActionTitle(entry.fields.action);
        const actorName = typeof entry.fields.actor === 'string' && entry.fields.actor.trim()
            ? entry.fields.actor.trim()
            : typeof entry.fields.player === 'string' && entry.fields.player.trim()
                ? entry.fields.player.trim()
                : '';

        return [baseTitle, actionTitle, actorName].filter(Boolean).join(' · ');
    }

    if (message) {
        return message;
    }

    if (entry.event) {
        return entry.event;
    }

    return fallback;
}

/**
 * Возвращает человекочитаемое название исхода проверки.
 *
 * @param entry Разобранная запись журнала.
 * @returns Текст исхода проверки.
 */
export function getLogCheckOutcomeTitle(entry: ILogEntryItem): string {
    const { fields } = entry;
    if (typeof fields.outcome_name === 'string' && fields.outcome_name) {
        return fields.outcome_name;
    }

    if (typeof fields.outcome === 'string' && fields.outcome in LOG_CHECK_OUTCOME_LABEL) {
        return LOG_CHECK_OUTCOME_LABEL[fields.outcome as ELogCheckOutcome];
    }

    if (fields.success === true) {
        return LOG_CHECK_OUTCOME_LABEL[ELogCheckOutcome.Success];
    }

    if (fields.success === false) {
        return LOG_CHECK_OUTCOME_LABEL[ELogCheckOutcome.Failure];
    }

    return 'Результат проверки';
}

/**
 * Извлекает идентификатор игрока или инициатора из полей записи для группировки ошибок.
 *
 * @param entry Разобранная запись журнала.
 * @returns Нормализованный ключ игрока или пустая строка, если игрок не указан.
 */
function getEntryPlayerGroupKey(entry: ILogEntryItem): string {
    const { fields } = entry;
    const rawPlayer = fields.player_uuid ?? fields.player ?? fields.actor_uuid ?? fields.actor;
    if (rawPlayer === undefined || rawPlayer === null) {
        return '';
    }

    return String(rawPlayer).trim().toLowerCase();
}

/**
 * Формирует сигнатуру ошибки игрока для схлопывания одинаковых ошибок, произошедших в разное время.
 *
 * @param entry Разобранная запись журнала.
 * @returns Строка-ключ сигнатуры или `null`, если запись не подлежит группировке.
 */
function getErrorGroupSignature(entry: ILogEntryItem): string | null {
    if (entry.parseError) {
        return null;
    }

    const playerKey = getEntryPlayerGroupKey(entry);
    if (!playerKey) {
        return null;
    }

    const { fields } = entry;
    const baseEvent = (normalizeLogEventCode(entry.event) ?? '').toLowerCase();
    const category = String(fields.category ?? '').trim().toLowerCase();
    const errorName = String(fields.error_name ?? '').trim().toLowerCase();
    const errorMessage = String(fields.error_message ?? fields.reason ?? '').trim();
    const message = String(fields.message ?? '').trim();
    const source = String(fields.source ?? '').trim().toLowerCase();
    const operation = String(fields.operation ?? '').trim().toLowerCase();

    return [
        playerKey,
        baseEvent,
        category,
        errorName,
        errorMessage,
        message,
        source,
        operation,
    ].join('\u001F');
}

/**
 * Группирует одинаковые ошибки одного игрока, произошедшие в разное время, в единые карточки.
 *
 * @param entries Список записей текущей страницы в категории `errors`.
 * @returns Упорядоченный список групп записей.
 */
export function groupErrorLogEntries(entries: readonly ILogEntryItem[]): ILogEntryGroup[] {
    const groups: ILogEntryGroup[] = [];
    const groupBySignature = new Map<string, ILogEntryGroup>();

    for (const entry of entries) {
        const signature = getErrorGroupSignature(entry);
        const entryCount = typeof entry.fields.count === 'number' && entry.fields.count > 0
            ? entry.fields.count
            : 1;

        const candidateTimestamps = [
            entry.timestamp,
            typeof entry.fields.first_at === 'string' ? entry.fields.first_at : null,
            typeof entry.fields.last_at === 'string' ? entry.fields.last_at : null,
        ].filter((val): val is string => Boolean(val && !Number.isNaN(Date.parse(val))));

        if (!signature) {
            groups.push({
                key: `single-${entry.byteOffset}`,
                primaryEntry: entry,
                entries: [entry],
                totalOccurrences: entryCount,
                earliestTimestamp: entry.timestamp,
                latestTimestamp: entry.timestamp,
            });
            continue;
        }

        const existing = groupBySignature.get(signature);
        if (!existing) {
            let earliest: string | null = entry.timestamp;
            let latest: string | null = entry.timestamp;

            for (const ts of candidateTimestamps) {
                if (!earliest || Date.parse(ts) < Date.parse(earliest)) {
                    earliest = ts;
                }

                if (!latest || Date.parse(ts) > Date.parse(latest)) {
                    latest = ts;
                }
            }

            const newGroup: ILogEntryGroup = {
                key: `group-${entry.byteOffset}`,
                primaryEntry: entry,
                entries: [entry],
                totalOccurrences: entryCount,
                earliestTimestamp: earliest,
                latestTimestamp: latest,
            };

            groupBySignature.set(signature, newGroup);
            groups.push(newGroup);
            continue;
        }

        existing.entries.push(entry);
        existing.totalOccurrences += entryCount;

        for (const ts of candidateTimestamps) {
            if (!existing.earliestTimestamp || Date.parse(ts) < Date.parse(existing.earliestTimestamp)) {
                existing.earliestTimestamp = ts;
            }

            if (!existing.latestTimestamp || Date.parse(ts) > Date.parse(existing.latestTimestamp)) {
                existing.latestTimestamp = ts;
            }
        }
    }

    return groups;
}
