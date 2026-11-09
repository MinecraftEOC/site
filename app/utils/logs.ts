import type { ILogEntryItem, TLogFieldValue } from '~~/shared/@types/logging';
import type { ELogCategory, ELogCheckType } from '~~/shared/enums/logging';

import {
    LOG_CATEGORY_LABEL,
    LOG_CHECK_OUTCOME_LABEL,
    LOG_CHECK_TYPE_LABEL,
    LOG_FIELD_LABELS,
} from '~~/shared/constants/logging';
import { ELogCheckOutcome } from '~~/shared/enums/logging';
import { BYTES_IN_KB } from '~/assets/ts/constants/common';
import { LOGS_DISPLAY_TIMEZONE } from '~/assets/ts/constants/logs';

const BYTES_IN_MB = BYTES_IN_KB * 1024;

const logDateTimeFormatter = new Intl.DateTimeFormat('ru-RU', {
    timeZone: LOGS_DISPLAY_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3,
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

    return String(value);
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
 * Возвращает заголовок карточки записи журнала по полям `message`, `check_name` или `event`.
 *
 * @param entry Разобранная запись журнала.
 * @param fallback Заголовок для нераспознанной строки.
 * @returns Заголовок карточки.
 */
export function getLogEntryTitle(entry: ILogEntryItem, fallback: string): string {
    const message = typeof entry.fields.message === 'string' ? entry.fields.message : '';
    const checkName = typeof entry.fields.check_name === 'string' ? entry.fields.check_name : '';
    const parts = [message, checkName].filter(Boolean);

    if (parts.length) {
        return parts.join(' · ');
    }

    if (entry.event) {
        return entry.event;
    }

    return fallback;
}

/**
 * Возвращает человекочитаемое название типа проверки.
 *
 * @param checkType Код типа проверки из `fields.check_type`.
 * @returns Название проверки на русском или исходный код.
 */
export function getLogCheckTypeTitle(checkType: string): string {
    if (checkType in LOG_CHECK_TYPE_LABEL) {
        return LOG_CHECK_TYPE_LABEL[checkType as ELogCheckType];
    }

    return checkType;
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
