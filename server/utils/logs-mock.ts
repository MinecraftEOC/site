import type {
    ILogCategoriesResponse,
    ILogEntriesResponse,
    ILogEntryItem,
    ILogFilesResponse,
    TLogFieldValue,
} from '~~/shared/@types/logging';
import type { ELogLevel } from '~~/shared/enums/logging';
import type { TLogCategoriesQuery, TLogEntriesQuery, TLogFilesQuery } from '~~/shared/schemas/logging';

import { Buffer } from 'node:buffer';

import { LOGS_ERRORS } from '~~/server/common/constants/logging';
import { LOG_CATEGORY_LABEL, LOG_CATEGORY_ORDER } from '~~/shared/constants/logging';
import { ELogCategory, ELogOrder } from '~~/shared/enums/logging';

/** Внутреннее представление мокового файла журнала для локальной разработки. */
interface IMockLogFile {
    /** Категория файла. */
    category: ELogCategory;
    /** Имя файла. */
    name: string;
    /** Время изменения файла в ISO 8601. */
    modifiedAt: string;
    /** UUID боя для файлов `combat`, иначе `null`. */
    combatUuid: string | null;
    /** Строки файла в порядке записи на диск (от старых к новым). */
    lines: string[];
}

const COMBAT_UUID_TAVERN = '018f0a4b-6b4f-7e90-b4a2-8c9d0e1f2a3b';
const COMBAT_UUID_DOCKS = '018f0a9c-3d12-7a41-9c55-4b1e7f8a9012';

/** Набор демонстрационных файлов журналов для локального просмотра без боевого сервера. */
const MOCK_LOG_FILES: readonly IMockLogFile[] = [
    {
        category: ELogCategory.Errors,
        name: '2026-04-19.log',
        modifiedAt: '2026-04-19T16:45:12.000Z',
        combatUuid: null,
        lines: [
            '2026-04-19T18:12:04.115+07:00 ERROR api.character.sync_failed category=api player="Адриан Вальд" player_uuid=8d9c4b10-1a23-4e56-9876-abcdef012345 status=503 duration_ms=5004 error_name=GatewayTimeoutError error_message="Сервис синхронизации персонажей не ответил за 5000 мс" message="Не удалось синхронизировать профиль персонажа при входе" stack="GatewayTimeoutError: Сервис синхронизации персонажей не ответил за 5000 мс\\n    at HttpClient.request (scripts/api/http_client.js:142:19)\\n    at syncCharacterProfile (scripts/character/sync.js:58:14)\\n    at onPlayerLogin (scripts/events/player_login.js:23:9)"',
            `2026-04-19T19:05:33.482+07:00 ERROR combat.turn.invalid_action category=combat combat=${COMBAT_UUID_TAVERN} round=3 turn_id=14 actor="Рено де Гри" actor_uuid=2a1b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d target="Корсар с пристани" action_id=parry_riposte reason="Недостаточно очков действий для ответного выпада" message="Попытка выполнить действие вне очереди хода"`,
            '2026-04-19T20:18:49.901+07:00 ERROR locks.pick.state_corrupted category=locks player="Лео де Бонарт" player_uuid=4f5e6d7c-8b9a-4c1d-2e3f-4a5b6c7d8e9f item_id=lockpick_steel stage=tumbler_3 error_name=StateReadError error_message="Отсутствует ключ difficulty в NBT замка двери [142, 68, -319]" message="Ошибка чтения параметров замка при взломе" stack="StateReadError: Отсутствует ключ difficulty в NBT замка двери [142, 68, -319]\\n    at readLockState (scripts/locks/lock_state.js:87:15)\\n    at handleLockpickAttempt (scripts/locks/pick.js:41:20)"',
            `2026-04-19T21:40:15.220+07:00 ERROR damage.apply.overflow category=damage combat=${COMBAT_UUID_DOCKS} round=5 actor="Капитан стражи" target="Маркус Фогель" damage=18 calculated=18 applied=12 hp_before=12 hp_after=0 error_name=ConditionSyncError error_message="Не удалось записать статус тяжёлого ранения в хранилище организации" message="Сбой синхронизации ранения после критического удара"`,
            '2026-04-19T22:01:09.004+07:00 ERROR states.save.failed category=states player="Ингрид Хольм" operation=write_faction_reputation organization_id=guild_merchants reason="Превышен лимит вложенности JSON-объекта состояния" message="Не удалось сохранить состояние игрока"',
        ],
    },
    {
        category: ELogCategory.Errors,
        name: '2026-04-18.log',
        modifiedAt: '2026-04-18T22:55:00.000Z',
        combatUuid: null,
        lines: [
            '2026-04-18T14:22:10.512+07:00 ERROR system.script.compile category=system source="scripts/quests/harbor_contraband.js" error_name=SyntaxError error_message="Unexpected identifier at line 94" message="Ошибка компиляции скрипта диалога" stack="SyntaxError: Unexpected identifier at line 94\\n    at ScriptLoader.compile (scripts/core/loader.js:61:11)"',
            '2026-04-18T19:44:02.180+07:00 ERROR api.sheets.export category=api operation=city_bank_sync status=502 reason="Bad Gateway при обращении к шлюзу таблиц" message="Не удалось выгрузить реестр банковских счетов"',
        ],
    },
    {
        category: ELogCategory.Checks,
        name: '2026-04-19.log',
        modifiedAt: '2026-04-19T16:50:40.000Z',
        combatUuid: null,
        lines: [
            '2026-04-19T17:10:12.340+07:00 INFO skill.check.resolved category=checks player="Адриан Вальд" player_uuid=8d9c4b10-1a23-4e56-9876-abcdef012345 check_name="Оценка заморских пряностей" check_type=trade outcome=success outcome_name="Успех" success=true roll=16 param=8 param_key=int skill=7 skill_key=trade modifier=1 bonus=0 result=24 difficulty=18 advantage=false disadvantage=false message="Игрок распознал поддельный шафран у купца"',
            '2026-04-19T17:24:51.809+07:00 INFO skill.check.resolved category=checks player="Лео де Бонарт" player_uuid=4f5e6d7c-8b9a-4c1d-2e3f-4a5b6c7d8e9f check_name="Взлом сундука казначея" check_type=lockpick outcome=failure outcome_name="Провал" success=false roll=4 param=7 param_key=agility skill=6 skill_key=dexterity modifier=-2 bonus=1 result=11 difficulty=17 advantage=false disadvantage=true attempt=2 message="Отмычка соскользнула с третьей пружины"',
            `2026-04-19T18:59:04.112+07:00 INFO skill.check.resolved category=checks combat=${COMBAT_UUID_TAVERN} round=1 player="Рено де Гри" actor="Рено де Гри" target="Корсар с пристани" check_name="Удар рапирой в выпаде" check_type=sword outcome=success outcome_name="Успех" success=true roll=18 param=9 param_key=reaction skill=8 skill_key=sword modifier=0 bonus=2 result=28 difficulty=21 advantage=true disadvantage=false message="Атака пробила защиту противника"`,
            `2026-04-19T19:01:28.650+07:00 INFO skill.check.resolved category=checks combat=${COMBAT_UUID_TAVERN} round=2 player="Рено де Гри" actor="Корсар с пристани" target="Рено де Гри" check_name="Уклонение от клинка" check_type=evasion outcome=tie outcome_name="Ничья" success=true roll=12 param=9 param_key=reaction skill=5 skill_key=evasion modifier=0 bonus=0 result=19 difficulty=19 advantage=false disadvantage=false message="Схватка на равных, удар прошёл вскользь"`,
            '2026-04-19T19:35:44.019+07:00 INFO skill.check.resolved category=checks player="Бьорн Торвальд" check_name="Ковка стального клинка" check_type=blacksmithing outcome=value outcome_name="Без проходного порога" roll=15 param=10 param_key=craft skill=8 skill_key=blacksmithing modifier=2 bonus=1 result=26 message="Определено качество выкованной заготовки"',
            '2026-04-19T20:05:17.902+07:00 INFO skill.check.resolved category=checks player="Ингрид Хольм" check_name="Переговоры с гильдией" check_type=management outcome=success outcome_name="Успех" success=true roll=14 param=9 param_key=int skill=7 skill_key=management modifier=1 bonus=0 result=23 difficulty=20 advantage=false disadvantage=false message="Согласована льготная пошлина на причал"',
            '2026-04-19T20:42:30.400+07:00 WARN skill.check.resolved category=checks player="Маркус Фогель" check_name="Прыжок через пролом в стене" check_type=athletics outcome=failure outcome_name="Провал" success=false roll=3 param=5 param_key=agility skill=4 skill_key=athletics modifier=-3 bonus=0 result=4 difficulty=14 advantage=false disadvantage=true reason="Тяжёлый доспех снижает манёвренность" message="Персонаж сорвался с карниза"',
        ],
    },
    {
        category: ELogCategory.Combat,
        name: `${COMBAT_UUID_TAVERN}.log`,
        modifiedAt: '2026-04-19T19:08:15.000Z',
        combatUuid: COMBAT_UUID_TAVERN,
        lines: [
            `2026-04-19T18:58:10.050+07:00 INFO combat.started category=combat combat=${COMBAT_UUID_TAVERN} round=1 actor="Рено де Гри" target="Корсар с пристани" source="Таверна «Старый якорь»" message="Начата боевая сцена в таверне"`,
            `2026-04-19T18:59:04.112+07:00 INFO skill.check.resolved category=combat combat=${COMBAT_UUID_TAVERN} round=1 turn_id=11 actor="Рено де Гри" target="Корсар с пристани" check_name="Атака рапирой" check_type=combat_attack outcome=success outcome_name="Успех" success=true roll=18 param=9 skill=8 modifier=0 bonus=2 result=28 difficulty=21 message="Успешный выпад рапирой"`,
            `2026-04-19T18:59:05.300+07:00 INFO combat.damage.dealt category=combat combat=${COMBAT_UUID_TAVERN} round=1 turn_id=11 actor="Рено де Гри" target="Корсар с пристани" damage=9 calculated=11 applied=9 hp_before=24 hp_after=15 message="Нанесён колющий урон противнику"`,
            `2026-04-19T19:01:28.650+07:00 INFO skill.check.resolved category=combat combat=${COMBAT_UUID_TAVERN} round=2 turn_id=12 actor="Корсар с пристани" target="Рено де Гри" check_name="Защита уклонением" check_type=combat_defense outcome=tie outcome_name="Ничья" success=true roll=12 param=9 skill=5 modifier=0 bonus=0 result=19 difficulty=19 message="Уклонение от контратаки корсара"`,
            `2026-04-19T19:05:33.482+07:00 ERROR combat.turn.invalid_action category=combat combat=${COMBAT_UUID_TAVERN} round=3 turn_id=14 actor="Рено де Гри" target="Корсар с пристани" action_id=parry_riposte reason="Недостаточно очков действий для ответного выпада" message="Попытка выполнить действие вне очереди хода"`,
            `2026-04-19T19:08:14.920+07:00 INFO combat.finished category=combat combat=${COMBAT_UUID_TAVERN} round=4 actor="Рено де Гри" target="Корсар с пристани" status=victory duration_ms=604870 message="Бой завершён победой инициатора"`,
        ],
    },
    {
        category: ELogCategory.Combat,
        name: `${COMBAT_UUID_DOCKS}.log`,
        modifiedAt: '2026-04-19T21:42:00.000Z',
        combatUuid: COMBAT_UUID_DOCKS,
        lines: [
            `2026-04-19T21:32:00.100+07:00 INFO combat.started category=combat combat=${COMBAT_UUID_DOCKS} round=1 actor="Капитан стражи" target="Маркус Фогель" source="Северные доки" message="Задержание нарушителя комендантского часа"`,
            `2026-04-19T21:36:18.440+07:00 INFO skill.check.resolved category=combat combat=${COMBAT_UUID_DOCKS} round=3 turn_id=7 actor="Капитан стражи" target="Маркус Фогель" check_name="Удар алебардой" check_type=shaft_weapon outcome=success outcome_name="Успех" success=true roll=17 param=8 skill=7 modifier=1 bonus=0 result=25 difficulty=16 message="Тяжёлый удар древковым оружием"`,
            `2026-04-19T21:40:15.220+07:00 ERROR damage.apply.overflow category=combat combat=${COMBAT_UUID_DOCKS} round=5 actor="Капитан стражи" target="Маркус Фогель" damage=18 calculated=18 applied=12 hp_before=12 hp_after=0 error_name=ConditionSyncError error_message="Не удалось записать статус тяжёлого ранения в хранилище организации" message="Сбой синхронизации ранения после критического удара"`,
            `2026-04-19T21:41:55.000+07:00 INFO combat.finished category=combat combat=${COMBAT_UUID_DOCKS} round=5 actor="Капитан стражи" target="Маркус Фогель" status=knockout duration_ms=594900 message="Противник обезврежен"`,
        ],
    },
    {
        category: ELogCategory.Damage,
        name: '2026-04-19.log',
        modifiedAt: '2026-04-19T21:41:00.000Z',
        combatUuid: null,
        lines: [
            `2026-04-19T18:59:05.300+07:00 INFO damage.applied category=damage combat=${COMBAT_UUID_TAVERN} round=1 actor="Рено де Гри" target="Корсар с пристани" damage=9 input=11 calculated=9 applied=9 hp_before=24 hp_after=15 damage_count_before=0 damage_count_after=1 message="Нанесён урон рапирой с учётом кожаного колета"`,
            '2026-04-19T20:42:31.110+07:00 WARN damage.fall category=damage player="Маркус Фогель" source=fall_damage damage=6 input=6 calculated=6 applied=6 hp_before=18 hp_after=12 damage_count_before=0 damage_count_after=1 reason="Падение с высоты 5 блоков" message="Получен урон от падения"',
            `2026-04-19T21:40:15.220+07:00 ERROR damage.apply.overflow category=damage combat=${COMBAT_UUID_DOCKS} round=5 actor="Капитан стражи" target="Маркус Фогель" damage=18 calculated=18 applied=12 hp_before=12 hp_after=0 damage_count_before=1 damage_count_after=3 death_condition=unconscious error_name=ConditionSyncError error_message="Не удалось записать статус тяжёлого ранения в хранилище организации" message="Персонаж потерял сознание от критического урона"`,
        ],
    },
    {
        category: ELogCategory.States,
        name: '2026-04-19.log',
        modifiedAt: '2026-04-19T22:02:00.000Z',
        combatUuid: null,
        lines: [
            '2026-04-19T16:00:12.040+07:00 INFO states.player.loaded category=states player="Адриан Вальд" player_uuid=8d9c4b10-1a23-4e56-9876-abcdef012345 operation=load_character_state duration_ms=14 message="Состояние персонажа загружено при входе на сервер"',
            '2026-04-19T19:15:00.511+07:00 INFO states.quest.checkpoint category=states player="Адриан Вальд" dialogue_id=harbor_master_intro checkpoint_id=accepted_inspection status=active message="Обновлена точка сюжетного диалога"',
            '2026-04-19T22:01:09.004+07:00 ERROR states.save.failed category=states player="Ингрид Хольм" operation=write_faction_reputation organization_id=guild_merchants reason="Превышен лимит вложенности JSON-объекта состояния" message="Не удалось сохранить состояние игрока"',
        ],
    },
    {
        category: ELogCategory.Locks,
        name: '2026-04-19.log',
        modifiedAt: '2026-04-19T20:20:00.000Z',
        combatUuid: null,
        lines: [
            '2026-04-19T17:24:51.809+07:00 INFO locks.pick.attempt category=locks player="Лео де Бонарт" item_id=lockpick_steel difficulty=17 result=11 success=false attempt=2 reason="Недостаточный итог проверки ловкости рук" message="Неудачная попытка взлома замка"',
            '2026-04-19T20:18:49.901+07:00 ERROR locks.pick.state_corrupted category=locks player="Лео де Бонарт" item_id=lockpick_steel stage=tumbler_3 error_name=StateReadError error_message="Отсутствует ключ difficulty в NBT замка двери [142, 68, -319]" message="Ошибка чтения параметров замка при взломе"',
        ],
    },
    {
        category: ELogCategory.Api,
        name: '2026-04-19.log',
        modifiedAt: '2026-04-19T21:10:00.000Z',
        combatUuid: null,
        lines: [
            '2026-04-19T16:00:11.890+07:00 INFO api.character.fetch category=api player="Адриан Вальд" player_uuid=8d9c4b10-1a23-4e56-9876-abcdef012345 operation="GET /api/server/character" status=200 duration_ms=38 message="Данные персонажа успешно получены с сайта"',
            '2026-04-19T16:00:12.410+07:00 INFO api.skins.fetch category=api player="Адриан Вальд" count=2 status=200 duration_ms=25 message="Список активных скинов синхронизирован"',
            '2026-04-19T18:12:04.115+07:00 ERROR api.character.sync_failed category=api player="Адриан Вальд" player_uuid=8d9c4b10-1a23-4e56-9876-abcdef012345 status=503 duration_ms=5004 error_name=GatewayTimeoutError error_message="Сервис синхронизации персонажей не ответил за 5000 мс" message="Не удалось синхронизировать профиль персонажа при входе"',
        ],
    },
    {
        category: ELogCategory.System,
        name: '2026-04-19.log',
        modifiedAt: '2026-04-19T22:10:00.000Z',
        combatUuid: null,
        lines: [
            '2026-04-19T12:00:01.012+07:00 INFO system.startup category=system stage=init count=42 duration_ms=310 message="Модули скриптов Эпохи Колонизации инициализированы"',
            '2026-04-19T15:30:00.004+07:00 DEBUG system.tables.reload category=system source="mappet/eoc/tables" count=14 duration_ms=95 message="Таблицы предметов и ремёсел перечитаны с диска"',
            '2026-04-19T21:55:10.777+07:00 WARN system.log.partial_line category=system reason="Обрыв кадра записи при перезагрузке скрипта" broken_field="незакрытая кавычка',
        ],
    },
];

const PREFIX_REGEX = /^(\S+)\s+(ERROR|WARN|INFO|DEBUG)\s+(\S+)(?:\s+|$)/;
const KEY_REGEX = /^[a-z_][\w.-]*=/i;
const NUMBER_REGEX = /^-?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i;

/**
 * Разбирает одну строку `logfmt` по тем же правилам, что и `data-exchanger`.
 *
 * @param raw Исходная строка журнала.
 * @param byteOffset Байтовое смещение начала строки в файле.
 * @returns Структурированная запись журнала.
 */
export function parseMockLogLine(raw: string, byteOffset: number): ILogEntryItem {
    const cleanRaw = raw.replace(/\r$/, '');
    const fields: Record<string, TLogFieldValue> = {};
    let parseError: string | null = null;

    const prefixMatch = PREFIX_REGEX.exec(cleanRaw);
    if (!prefixMatch || Number.isNaN(Date.parse(prefixMatch[1] ?? ''))) {
        return {
            byteOffset,
            timestamp: null,
            level: null,
            event: null,
            fields,
            raw: cleanRaw,
            parseError: 'Не удалось распознать время, уровень или событие',
            rawTruncated: false,
        };
    }

    const timestamp = prefixMatch[1] ?? null;
    const level = (prefixMatch[2] as ELogLevel | undefined) ?? null;
    const event = prefixMatch[3] ?? null;
    let position = prefixMatch[0].length;

    try {
        while (position < cleanRaw.length) {
            while (position < cleanRaw.length && /\s/.test(cleanRaw[position] ?? '')) {
                position += 1;
            }

            if (position >= cleanRaw.length) {
                break;
            }

            const keyMatch = KEY_REGEX.exec(cleanRaw.slice(position));
            if (!keyMatch) {
                throw new Error(`Нераспознанное поле после позиции ${position + 1}`);
            }

            const key = keyMatch[0].slice(0, -1);
            position += keyMatch[0].length;
            const start = position;
            let value: TLogFieldValue;

            if (cleanRaw[position] === '"') {
                position += 1;
                let closed = false;
                while (position < cleanRaw.length) {
                    if (cleanRaw[position] === '\\') {
                        position += 2;
                        continue;
                    }

                    if (cleanRaw[position] === '"') {
                        position += 1;
                        closed = true;
                        break;
                    }

                    position += 1;
                }

                if (!closed) {
                    throw new Error(`Незакрытая строка в поле ${key}`);
                }

                value = JSON.parse(cleanRaw.slice(start, position)) as string;
                if (position < cleanRaw.length && !/\s/.test(cleanRaw[position] ?? '')) {
                    throw new Error(`Нет пробела после поля ${key}`);
                }
            } else {
                while (position < cleanRaw.length && !/\s/.test(cleanRaw[position] ?? '')) {
                    position += 1;
                }

                const token = cleanRaw.slice(start, position);
                if (!token) {
                    throw new Error(`Пустое значение поля ${key}`);
                }

                if (token === 'null') {
                    value = null;
                } else if (token === 'true') {
                    value = true;
                } else if (token === 'false') {
                    value = false;
                } else if (NUMBER_REGEX.test(token)) {
                    const num = Number(token);
                    value = Number.isFinite(num) ? num : token;
                } else {
                    value = token;
                }
            }

            fields[key] = value;
        }
    } catch (error) {
        parseError = error instanceof Error ? error.message : 'Ошибка разбора полей строки';
    }

    return {
        byteOffset,
        timestamp,
        level,
        event,
        fields,
        raw: cleanRaw,
        parseError,
        rawTruncated: false,
    };
}

/**
 * Вычисляет размер файла в байтах по массиву строк.
 *
 * @param lines Строки файла.
 * @returns Суммарный размер файла в UTF-8 с переводами строк.
 */
function getMockFileSize(lines: readonly string[]): number {
    return Buffer.byteLength(`${lines.join('\n')}\n`, 'utf-8');
}

/**
 * Возвращает список категорий из локального мок-набора.
 *
 * @param _query Параметры запроса категорий.
 * @returns Ответ со списком категорий.
 */
export function getMockLogCategories(_query: TLogCategoriesQuery): ILogCategoriesResponse {
    return {
        items: LOG_CATEGORY_ORDER.map((id) => {
            const hasFiles = MOCK_LOG_FILES.some(file => file.category === id);
            return {
                id,
                label: LOG_CATEGORY_LABEL[id],
                available: true,
                hasFiles,
            };
        }),
    };
}

/**
 * Возвращает список файлов категории из локального мок-набора.
 *
 * @param query Параметры запроса файлов.
 * @returns Ответ со списком файлов категории.
 */
export function getMockLogFiles(query: TLogFilesQuery): ILogFilesResponse {
    const searchLower = query.search?.toLowerCase() ?? '';
    const matched = MOCK_LOG_FILES
        .filter(file => file.category === query.category)
        .filter(file => !searchLower
            || file.name.toLowerCase().includes(searchLower)
            || (file.combatUuid?.toLowerCase().includes(searchLower) ?? false))
        .sort((a, b) => Date.parse(b.modifiedAt) - Date.parse(a.modifiedAt) || b.name.localeCompare(a.name));

    const sliced = matched.slice(query.offset, query.offset + query.limit);

    return {
        items: sliced.map(file => ({
            name: file.name,
            sizeBytes: getMockFileSize(file.lines),
            modifiedAt: file.modifiedAt,
            combatUuid: file.combatUuid,
        })),
        total: matched.length,
        offset: query.offset,
        limit: query.limit,
    };
}

/**
 * Возвращает отфильтрованные записи выбранного файла из локального мок-набора.
 *
 * @param query Параметры запроса записей.
 * @returns Ответ с записями и курсором пагинации.
 * @throws `404` если файл не найден в мок-наборе.
 * @throws `400` если курсор не соответствует параметрам запроса.
 */
export function getMockLogEntries(query: TLogEntriesQuery): ILogEntriesResponse {
    const mockFile = MOCK_LOG_FILES.find(item => item.category === query.category && item.name === query.file);
    if (!mockFile) {
        throw createError({ statusCode: 404, message: LOGS_ERRORS.FILE_NOT_FOUND });
    }

    let currentOffset = 0;
    const parsedEntries = mockFile.lines.map((line) => {
        const entry = parseMockLogLine(line, currentOffset);
        currentOffset += Buffer.byteLength(`${line}\n`, 'utf-8');
        return entry;
    });

    const ordered = query.order === ELogOrder.Desc ? [...parsedEntries].reverse() : parsedEntries;
    const qLower = query.q?.toLowerCase();

    const filtered = ordered.filter((entry) => {
        if (query.level && entry.level !== query.level) {
            return false;
        }

        if (query.event && entry.event !== query.event) {
            return false;
        }

        if (query.checkType && entry.fields.check_type !== query.checkType) {
            return false;
        }

        if (query.outcome && entry.fields.outcome !== query.outcome) {
            return false;
        }

        if (qLower && !entry.raw.toLowerCase().includes(qLower)) {
            return false;
        }

        return true;
    });

    let startIndex = 0;
    if (query.cursor) {
        try {
            const decoded = JSON.parse(Buffer.from(query.cursor, 'base64url').toString('utf-8')) as {
                cat?: string;
                file?: string;
                ord?: string;
                idx?: number;
            };
            if (
                decoded.cat !== query.category
                || decoded.file !== query.file
                || decoded.ord !== query.order
                || typeof decoded.idx !== 'number'
                || decoded.idx < 0
            ) {
                throw new Error('Invalid cursor');
            }

            startIndex = decoded.idx;
        } catch {
            throw createError({ statusCode: 400, message: LOGS_ERRORS.BAD_REQUEST });
        }
    }

    const items = filtered.slice(startIndex, startIndex + query.limit);
    const nextIndex = startIndex + items.length;
    const hasMore = nextIndex < filtered.length;
    const nextCursor = hasMore
        ? Buffer.from(
                JSON.stringify({
                    cat: query.category,
                    file: query.file,
                    ord: query.order,
                    idx: nextIndex,
                }),
                'utf-8',
            ).toString('base64url')
        : null;

    const sizeBytes = getMockFileSize(mockFile.lines);

    return {
        file: {
            category: mockFile.category,
            name: mockFile.name,
            sizeBytes,
            modifiedAt: mockFile.modifiedAt,
        },
        items,
        nextCursor,
        hasMore,
        scanLimited: false,
        scannedBytes: sizeBytes,
    };
}
