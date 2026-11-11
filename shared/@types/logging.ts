import type { ELogCategory, ELogLevel } from '~~/shared/enums/logging';

/** Скалярное значение поля `logfmt` внутри записи журнала. */
export type TLogFieldValue = string | number | boolean | null;

/** Информация о категории серверных журналов. */
export interface ILogCategoryItem {
    /** Идентификатор категории на диске. */
    id: ELogCategory;
    /** Человекочитаемое название категории на русском. */
    label: string;
    /** Существует ли и читается ли папка категории. */
    available: boolean;
    /** Есть ли в категории хотя бы один валидный `.log` файл. */
    hasFiles: boolean;
}

/** Элемент списка файлов журнала в рамках одной категории. */
export interface ILogFileItem {
    /** Имя файла без пути (например, `2026-04-19.log`). */
    name: string;
    /** Размер файла в байтах. */
    sizeBytes: number;
    /** Время последнего изменения в ISO 8601. */
    modifiedAt: string;
    /** UUID боя для файлов категории `combat`, иначе `null`. */
    combatUuid: string | null;
}

/** Краткие метаданные выбранного файла в ответе чтения записей. */
export interface ILogEntryFileMeta {
    /** Категория файла журнала. */
    category: ELogCategory;
    /** Имя файла без пути. */
    name: string;
    /** Текущий размер файла в байтах. */
    sizeBytes: number;
    /** Время последнего изменения файла в ISO 8601. */
    modifiedAt: string;
}

/** Разобранная строка серверного журнала (`logfmt`). */
export interface ILogEntryItem {
    /** Смещение начала строки в файле в байтах (стабильный ключ записи). */
    byteOffset: number;
    /** Оригинальная метка времени из префикса строки или `null` при ошибке разбора. */
    timestamp: string | null;
    /** Уровень записи или `null`, если префикс строки повреждён. */
    level: ELogLevel | null;
    /** Код события (например, `skill.check.resolved`) или `null`. */
    event: string | null;
    /** Разобранные пары `key=value` из `logfmt`. */
    fields: Record<string, TLogFieldValue>;
    /** Исходная строка целиком (без `\r\n`), усечённая до 64 КиБ при превышении лимита. */
    raw: string;
    /** Причина неполного разбора строки или `null`, если строка валидна. */
    parseError: string | null;
    /** Признак того, что исходная строка превысила 64 КиБ и была усечена. */
    rawTruncated: boolean;
}

/** Сгруппированный набор одинаковых записей об ошибке одного игрока. */
export interface ILogEntryGroup {
    /** Уникальный ключ группы в рамках текущей порции записей. */
    key: string;
    /** Головная (первая в текущем порядке сортировки) запись группы. */
    primaryEntry: ILogEntryItem;
    /** Все записи журнала, попавшие в эту группу. */
    entries: ILogEntryItem[];
    /** Суммарное количество срабатываний с учётом поля `count` у повторяющихся ошибок. */
    totalOccurrences: number;
    /** Самая ранняя метка времени в группе (с учётом `first_at`) или `null`. */
    earliestTimestamp: string | null;
    /** Самая поздняя метка времени в группе (с учётом `last_at`) или `null`. */
    latestTimestamp: string | null;
}

/** Ответ со списком категорий журналов. */
export interface ILogCategoriesResponse {
    /** Список всех известных категорий журналов. */
    items: ILogCategoryItem[];
}

/** Ответ со списком файлов выбранной категории. */
export interface ILogFilesResponse {
    /** Отфильтрованные файлы текущей выборки. */
    items: ILogFileItem[];
    /** Общее количество файлов в категории после фильтра `search`. */
    total: number;
    /** Смещение начала выборки. */
    offset: number;
    /** Размер выборки. */
    limit: number;
}

/** Ответ с порцией записей выбранного файла журнала. */
export interface ILogEntriesResponse {
    /** Метаданные прочитанного файла. */
    file: ILogEntryFileMeta;
    /** Найденные записи текущей порции. */
    items: ILogEntryItem[];
    /** Подписанный курсор для чтения следующей порции или `null`. */
    nextCursor: string | null;
    /** Есть ли ещё непрочитанные данные в файле в выбранном направлении. */
    hasMore: boolean;
    /** Признак того, что чтение остановилось по лимиту просмотренных байт (2 МиБ) или времени. */
    scanLimited: boolean;
    /** Количество байт файла, просмотренных при выполнении этого запроса. */
    scannedBytes: number;
}
