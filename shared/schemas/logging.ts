import { z } from 'zod';

import {
    hasControlCharacters,
    isSafeLogToken,
    LOG_COMBAT_FILE_REGEX,
    LOG_DATED_FILE_REGEX,
    LOGS_CURSOR_MAX_LENGTH,
    LOGS_DEFAULT_LIMIT,
    LOGS_EVENT_MAX_LENGTH,
    LOGS_FILE_SEARCH_MAX_LENGTH,
    LOGS_MAX_LIMIT,
    LOGS_SEARCH_MAX_LENGTH,
} from '~~/shared/constants/logging';
import { ELogCategory, ELogCheckOutcome, ELogCombatAction, ELogLevel, ELogOrder } from '~~/shared/enums/logging';

/** Тексты ошибок валидации запросов к серверным журналам. */
export const LOGS_QUERY_ERRORS = {
    CATEGORY_INVALID: 'Указана неизвестная категория журналов',
    FILE_REQUIRED: 'Укажите имя файла журнала',
    FILE_INVALID: 'Недопустимое имя файла журнала',
    LIMIT_INVALID: `Размер выборки должен быть целым числом от 1 до ${LOGS_MAX_LIMIT}`,
    OFFSET_INVALID: 'Смещение списка файлов не может быть отрицательным',
    ORDER_INVALID: 'Недопустимый порядок сортировки записей',
    LEVEL_INVALID: 'Указан неизвестный уровень записи',
    OUTCOME_INVALID: 'Указан неизвестный исход проверки',
    ACTION_INVALID: 'Указано неизвестное боевое действие',
    EVENT_INVALID: 'Недопустимое значение фильтра события',
    CHECK_TYPE_INVALID: 'Недопустимое значение типа проверки',
    SEARCH_TOO_LONG: `Поисковый запрос не должен превышать ${LOGS_SEARCH_MAX_LENGTH} символов`,
    FILE_SEARCH_TOO_LONG: `Поисковый запрос по файлам не должен превышать ${LOGS_FILE_SEARCH_MAX_LENGTH} символов`,
    CURSOR_INVALID: 'Некорректный курсор пагинации',
};

/**
 * Проверяет корректность имени файла `.log` для заданной категории.
 *
 * @param category Категория журналов.
 * @param file Имя файла без пути.
 * @returns `true`, если имя соответствует шаблонам категории.
 */
export function isValidLogFilename(category: ELogCategory, file: string): boolean {
    if (!file || file.length > LOGS_FILE_SEARCH_MAX_LENGTH || !isSafeLogToken(file)) {
        return false;
    }

    if (category === ELogCategory.Combat && LOG_COMBAT_FILE_REGEX.test(file)) {
        return true;
    }

    if (!LOG_DATED_FILE_REGEX.test(file)) {
        return false;
    }

    const datePart = file.slice(0, 10);
    const [yearStr, monthStr, dayStr] = datePart.split('-');
    const year = Number(yearStr);
    const month = Number(monthStr);
    const day = Number(dayStr);
    const dt = new Date(Date.UTC(year, month - 1, day));

    return dt.getUTCFullYear() === year && dt.getUTCMonth() === month - 1 && dt.getUTCDate() === day;
}

/** Булев query-параметр `refresh` (`true`/`1`). */
const refreshField = z
    .union([z.boolean(), z.string()])
    .optional()
    .transform(val => val === true || val === 'true' || val === '1');

/** Поле категории журналов. */
const categoryField = z.nativeEnum(ELogCategory, {
    required_error: LOGS_QUERY_ERRORS.CATEGORY_INVALID,
    invalid_type_error: LOGS_QUERY_ERRORS.CATEGORY_INVALID,
});

/** Поле лимита записей или файлов. */
const limitField = z.coerce
    .number({ invalid_type_error: LOGS_QUERY_ERRORS.LIMIT_INVALID })
    .int(LOGS_QUERY_ERRORS.LIMIT_INVALID)
    .min(1, LOGS_QUERY_ERRORS.LIMIT_INVALID)
    .max(LOGS_MAX_LIMIT, LOGS_QUERY_ERRORS.LIMIT_INVALID)
    .default(LOGS_DEFAULT_LIMIT);

/** Схема query-параметров `GET /api/admin/logs/categories`. */
export const sharedLogCategoriesQuerySchema = z.object({
    refresh: refreshField,
});

/** Схема query-параметров `GET /api/admin/logs/files`. */
export const sharedLogFilesQuerySchema = z.object({
    category: categoryField,
    search: z
        .string()
        .trim()
        .max(LOGS_FILE_SEARCH_MAX_LENGTH, LOGS_QUERY_ERRORS.FILE_SEARCH_TOO_LONG)
        .refine(val => !hasControlCharacters(val) && !/[/\\]/.test(val), LOGS_QUERY_ERRORS.FILE_INVALID)
        .optional()
        .transform(val => val || undefined),
    offset: z.coerce
        .number({ invalid_type_error: LOGS_QUERY_ERRORS.OFFSET_INVALID })
        .int(LOGS_QUERY_ERRORS.OFFSET_INVALID)
        .min(0, LOGS_QUERY_ERRORS.OFFSET_INVALID)
        .default(0),
    limit: limitField,
    refresh: refreshField,
});

/** Схема query-параметров `GET /api/admin/logs/entries`. */
export const sharedLogEntriesQuerySchema = z
    .object({
        category: categoryField,
        file: z
            .string({ required_error: LOGS_QUERY_ERRORS.FILE_REQUIRED })
            .trim()
            .min(1, LOGS_QUERY_ERRORS.FILE_REQUIRED)
            .max(LOGS_FILE_SEARCH_MAX_LENGTH, LOGS_QUERY_ERRORS.FILE_INVALID),
        limit: limitField,
        order: z
            .nativeEnum(ELogOrder, { invalid_type_error: LOGS_QUERY_ERRORS.ORDER_INVALID })
            .default(ELogOrder.Desc),
        cursor: z
            .string()
            .trim()
            .max(LOGS_CURSOR_MAX_LENGTH, LOGS_QUERY_ERRORS.CURSOR_INVALID)
            .optional()
            .transform(val => val || undefined),
        level: z
            .preprocess(val => (val === '' ? undefined : val), z.nativeEnum(ELogLevel, {
                invalid_type_error: LOGS_QUERY_ERRORS.LEVEL_INVALID,
            }).optional()),
        q: z
            .string()
            .trim()
            .max(LOGS_SEARCH_MAX_LENGTH, LOGS_QUERY_ERRORS.SEARCH_TOO_LONG)
            .refine(val => !val.includes('\u0000'), LOGS_QUERY_ERRORS.SEARCH_TOO_LONG)
            .optional()
            .transform(val => val || undefined),
        event: z
            .string()
            .trim()
            .max(LOGS_EVENT_MAX_LENGTH, LOGS_QUERY_ERRORS.EVENT_INVALID)
            .refine(val => !val || isSafeLogToken(val), LOGS_QUERY_ERRORS.EVENT_INVALID)
            .optional()
            .transform(val => val || undefined),
        checkType: z
            .string()
            .trim()
            .max(LOGS_EVENT_MAX_LENGTH, LOGS_QUERY_ERRORS.CHECK_TYPE_INVALID)
            .refine(val => !val || isSafeLogToken(val), LOGS_QUERY_ERRORS.CHECK_TYPE_INVALID)
            .optional()
            .transform(val => val || undefined),
        outcome: z
            .preprocess(val => (val === '' ? undefined : val), z.nativeEnum(ELogCheckOutcome, {
                invalid_type_error: LOGS_QUERY_ERRORS.OUTCOME_INVALID,
            }).optional()),
        action: z
            .preprocess(val => (val === '' ? undefined : val), z.nativeEnum(ELogCombatAction, {
                invalid_type_error: LOGS_QUERY_ERRORS.ACTION_INVALID,
            }).optional()),
    })
    .superRefine((data, ctx) => {
        if (!isValidLogFilename(data.category, data.file)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['file'],
                message: LOGS_QUERY_ERRORS.FILE_INVALID,
            });
        }
    });

/** Схема проверки ответа upstream `GET /api/logs/categories`. */
export const sharedLogCategoriesResponseSchema = z.object({
    items: z.array(
        z.object({
            id: categoryField,
            label: z.string(),
            available: z.boolean(),
            hasFiles: z.boolean(),
        }),
    ),
});

/** Схема проверки ответа upstream `GET /api/logs/files`. */
export const sharedLogFilesResponseSchema = z.object({
    items: z.array(
        z.object({
            name: z.string(),
            sizeBytes: z.number().int().nonnegative(),
            modifiedAt: z.string(),
            combatUuid: z.string().nullable(),
        }),
    ),
    total: z.number().int().nonnegative(),
    offset: z.number().int().nonnegative(),
    limit: z.number().int().positive(),
});

/** Схема проверки ответа upstream `GET /api/logs/entries`. */
export const sharedLogEntriesResponseSchema = z.object({
    file: z.object({
        category: categoryField,
        name: z.string(),
        sizeBytes: z.number().int().nonnegative(),
        modifiedAt: z.string(),
    }),
    items: z.array(
        z.object({
            byteOffset: z.number().int().nonnegative(),
            timestamp: z.string().nullable(),
            level: z.nativeEnum(ELogLevel).nullable(),
            event: z.string().nullable(),
            fields: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])),
            raw: z.string(),
            parseError: z.string().nullable(),
            rawTruncated: z.boolean(),
        }),
    ),
    nextCursor: z.string().nullable(),
    hasMore: z.boolean(),
    scanLimited: z.boolean(),
    scannedBytes: z.number().int().nonnegative(),
});

/** Тип провалидированных query-параметров списка категорий. */
export type TLogCategoriesQuery = z.infer<typeof sharedLogCategoriesQuerySchema>;

/** Тип провалидированных query-параметров списка файлов. */
export type TLogFilesQuery = z.infer<typeof sharedLogFilesQuerySchema>;

/** Тип провалидированных query-параметров чтения записей. */
export type TLogEntriesQuery = z.infer<typeof sharedLogEntriesQuerySchema>;
