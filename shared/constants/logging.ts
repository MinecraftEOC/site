import {
    ELogCategory,
    ELogCheckOutcome,
    ELogCheckType,
    ELogCombatAction,
    ELogLevel,
    ELogOrder,
} from '~~/shared/enums/logging';

/** Размер порции записей или файлов по умолчанию. */
export const LOGS_DEFAULT_LIMIT = 100;

/** Максимальный размер порции записей или файлов за один запрос. */
export const LOGS_MAX_LIMIT = 200;

/** Максимальная длина текстового поискового запроса `q`. */
export const LOGS_SEARCH_MAX_LENGTH = 200;

/** Максимальная длина поисковой подстроки по имени файла или UUID боя. */
export const LOGS_FILE_SEARCH_MAX_LENGTH = 128;

/** Максимальная длина кода события `event` или типа проверки `checkType`. */
export const LOGS_EVENT_MAX_LENGTH = 128;

/** Максимальная длина подписанного курсора пагинации. */
export const LOGS_CURSOR_MAX_LENGTH = 4096;

/** Регулярка обычного суточного или ротированного файла журнала (`YYYY-MM-DD.log` и `YYYY-MM-DD.NNN.log`). */
export const LOG_DATED_FILE_REGEX = /^\d{4}-\d{2}-\d{2}(?:\.\d{3})?\.log$/;

/** Регулярка файла боя в категории `combat` (`<uuid>.log`). */
export const LOG_COMBAT_FILE_REGEX = /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}\.log$/i;

/**
 * Проверяет, содержит ли строка управляющие ASCII-символы (`0x00`–`0x1F`, `0x7F`).
 *
 * @param value Проверяемая строка.
 * @returns `true`, если в строке есть управляющие символы.
 */
export function hasControlCharacters(value: string): boolean {
    for (let i = 0; i < value.length; i += 1) {
        const code = value.charCodeAt(i);
        if (code <= 0x1F || code === 0x7F) {
            return true;
        }
    }

    return false;
}

/**
 * Проверяет, является ли строка безопасным токеном без пробелов, слэшей, двоеточий, `..` и управляющих символов.
 *
 * @param value Проверяемая строка.
 * @returns `true`, если строка безопасна для использования как имя файла или токен события.
 */
export function isSafeLogToken(value: string): boolean {
    if (!value || value.includes('..') || hasControlCharacters(value)) {
        return false;
    }

    return !/[\s/\\:]/.test(value);
}

/** Порядок отображения категорий журналов в переключателе разделов. */
export const LOG_CATEGORY_ORDER: readonly ELogCategory[] = [
    ELogCategory.Errors,
    ELogCategory.Checks,
    ELogCategory.Combat,
    ELogCategory.Damage,
    ELogCategory.States,
    ELogCategory.Locks,
    ELogCategory.Api,
    ELogCategory.System,
];

/** Человекочитаемые названия категорий журналов. */
export const LOG_CATEGORY_LABEL: Record<ELogCategory, string> = {
    [ELogCategory.Errors]: 'Ошибки',
    [ELogCategory.System]: 'Система',
    [ELogCategory.States]: 'Стейты',
    [ELogCategory.Damage]: 'Урон',
    [ELogCategory.Locks]: 'Взлом',
    [ELogCategory.Api]: 'API',
    [ELogCategory.Checks]: 'Проверки навыков',
    [ELogCategory.Combat]: 'Бои',
};

/** Иконки категорий журналов для отображения на вкладках. */
export const LOG_CATEGORY_ICON: Record<ELogCategory, string> = {
    [ELogCategory.Errors]: 'triangle-alert',
    [ELogCategory.Checks]: 'dices',
    [ELogCategory.Combat]: 'swords',
    [ELogCategory.Damage]: 'heart-crack',
    [ELogCategory.States]: 'database',
    [ELogCategory.Locks]: 'key-round',
    [ELogCategory.Api]: 'globe',
    [ELogCategory.System]: 'cpu',
};

/** Человекочитаемые подписи уровней записи. */
export const LOG_LEVEL_LABEL: Record<ELogLevel, string> = {
    [ELogLevel.Error]: 'ERROR',
    [ELogLevel.Warn]: 'WARN',
    [ELogLevel.Info]: 'INFO',
    [ELogLevel.Debug]: 'DEBUG',
};

/** Человекочитаемые подписи порядка сортировки записей. */
export const LOG_ORDER_LABEL: Record<ELogOrder, string> = {
    [ELogOrder.Desc]: 'Сначала новые',
    [ELogOrder.Asc]: 'Сначала старые',
};

/** Человекочитаемые подписи исходов проверки навыка. */
export const LOG_CHECK_OUTCOME_LABEL: Record<ELogCheckOutcome, string> = {
    [ELogCheckOutcome.Success]: 'Успех',
    [ELogCheckOutcome.Failure]: 'Провал',
    [ELogCheckOutcome.Tie]: 'Ничья',
    [ELogCheckOutcome.Value]: 'Без проходного порога',
};

/** Человекочитаемые названия 26 типов проверок из каталога. */
export const LOG_CHECK_TYPE_LABEL: Record<ELogCheckType, string> = {
    [ELogCheckType.Int]: 'Интеллект',
    [ELogCheckType.Agility]: 'Ловкость',
    [ELogCheckType.Const]: 'Телосложение',
    [ELogCheckType.Reaction]: 'Реакция',
    [ELogCheckType.Craft]: 'Ремесло',
    [ELogCheckType.Trade]: 'Торговля',
    [ELogCheckType.Management]: 'Управление',
    [ELogCheckType.Education]: 'Образование',
    [ELogCheckType.Dexterity]: 'Ловкость рук',
    [ELogCheckType.Shooting]: 'Стрельба',
    [ELogCheckType.Athletics]: 'Атлетика',
    [ELogCheckType.Resistance]: 'Стойкость',
    [ELogCheckType.Strength]: 'Сила',
    [ELogCheckType.Melee]: 'Ближний бой',
    [ELogCheckType.Sword]: 'Владение мечом',
    [ELogCheckType.ShaftWeapon]: 'Владение древковым оружием',
    [ELogCheckType.Blades]: 'Владение клинками',
    [ELogCheckType.Evasion]: 'Уклонение',
    [ELogCheckType.Farming]: 'Фермерство',
    [ELogCheckType.Hunting]: 'Охотничье ремесло',
    [ELogCheckType.Carpentry]: 'Плотничество',
    [ELogCheckType.Blacksmithing]: 'Кузнечное дело',
    [ELogCheckType.Mining]: 'Шахтёрство',
    [ELogCheckType.Lockpick]: 'Взлом замка',
    [ELogCheckType.CombatAttack]: 'Атака в бою',
    [ELogCheckType.CombatDefense]: 'Защита в бою',
};

/** Человекочитаемые названия боевых действий (`fields.action` в `combat.*`). */
export const LOG_COMBAT_ACTION_LABEL: Record<ELogCombatAction, string> = {
    [ELogCombatAction.Attack]: 'Атака',
    [ELogCombatAction.EquipmentChange]: 'Смена снаряжения',
    [ELogCombatAction.FullDefense]: 'Глухая защита',
    [ELogCombatAction.Potion]: 'Зелье',
    [ELogCombatAction.None]: 'Без действия',
};

/** Русские подписи известных полей `logfmt` для раскрытия карточки записи. */
export const LOG_FIELD_LABELS: Readonly<Record<string, string>> = {
    v: 'Версия формата',
    run: 'ID запуска',
    seq: 'Номер записи',
    first_at: 'Первое появление',
    last_at: 'Последнее появление',
    message: 'Сообщение',
    category: 'Исходная категория',
    player: 'Игрок',
    player_uuid: 'UUID игрока',
    actor: 'Инициатор',
    actor_uuid: 'UUID инициатора',
    target: 'Цель',
    target_uuid: 'UUID цели',
    check_name: 'Проверка',
    check_type: 'Код проверки',
    outcome_name: 'Исход проверки',
    outcome: 'Код исхода',
    success: 'Успех',
    result: 'Итог',
    total: 'Итог',
    roll: 'Исходный кубик (d20)',
    param: 'Параметр',
    skill: 'Навык',
    difficulty: 'Сложность / встречная проверка',
    modifier: 'Модификатор',
    bonus: 'Бонус',
    advantage: 'Преимущество',
    disadvantage: 'Помеха',
    attempt: 'Попытка',
    param_key: 'Код параметра',
    skill_key: 'Код навыка',
    combat: 'UUID боя',
    round: 'Раунд',
    turn_id: 'Ход',
    action: 'Действие',
    action_id: 'ID действия',
    effect_id: 'Эффект',
    movement_distance: 'Дистанция перемещения',
    movement_spent: 'Затрачено перемещения',
    source: 'Источник',
    operation: 'Операция',
    reason: 'Причина',
    stage: 'Этап',
    stack: 'Стек ошибки',
    details: 'Подробности',
    error_name: 'Вид ошибки',
    error_message: 'Текст ошибки',
    damage: 'Урон',
    input: 'Исходное значение',
    calculated: 'Рассчитано',
    applied: 'Применено',
    hp_before: 'HP до',
    hp_after: 'HP после',
    damage_count_before: 'Ранений до',
    damage_count_after: 'Ранений после',
    death_condition: 'Условие смерти',
    count: 'Количество',
    duration_ms: 'Длительность, мс',
    status: 'Статус',
    item_id: 'Предмет',
    organization_id: 'Организация',
    dialogue_id: 'Диалог',
    checkpoint_id: 'Точка диалога',
    order_id: 'Заказ',
    table_id: 'ID таблицы крафта/торговли',
};

/** Ключи технических (служебных) полей записи журнала, выносимых в сворачиваемую группу. */
export const LOG_TECHNICAL_FIELD_KEYS: readonly string[] = [
    'v',
    'run',
    'seq',
    'category',
    'first_at',
    'last_at',
    'operation',
    'player_uuid',
    'actor_uuid',
    'target_uuid',
    'combat',
    'turn_id',
    'action_id',
    'effect_id',
];
