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
import { ELogCategory, ELogCombatAction, ELogOrder } from '~~/shared/enums/logging';

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
        name: '2026-11-08.001.log',
        modifiedAt: '2026-11-08T15:11:27.139Z',
        combatUuid: null,
        lines: [
            '2026-11-08T22:09:53.109+07:00 ERROR script.failed v=1 run="c843726b-ad35-4ede-8ae0-83a7f9d5db28" seq=126 category="system" error_message="\\"EocHudApi\\" is not defined" error_name="ReferenceError" operation="main" player="Kiras" player_uuid="bda71d53-e4e9-47a4-a6c6-7cfd0c08acab" source="handlers/player/handlePlayerWatchCraftBlock.ts" stack="ReferenceError: \\"EocHudApi\\" is not defined\\n\\tat _loop_1 (handlers/player/handlePlayerWatchCraftBlock.js:4112)\\n\\tat syncPotionEffectIndicators (handlers/player/handlePlayerWatchCraftBlock.js:4123)\\n\\tat processPotionEffects (handlers/player/handlePlayerWatchCraftBlock.js:3907)\\n\\tat main (handlers/player/handlePlayerWatchCraftBlock.js:6989)"',
            '2026-11-08T22:10:22.114+07:00 ERROR script.failed.repeated v=1 run="c843726b-ad35-4ede-8ae0-83a7f9d5db28" seq=158 category="system" count=29 error_message="\\"EocHudApi\\" is not defined" error_name="ReferenceError" first_at="2026-11-08T22:09:53.109+07:00" last_at="2026-11-08T22:10:22.114+07:00" operation="main" player="Kiras" player_uuid="bda71d53-e4e9-47a4-a6c6-7cfd0c08acab" source="handlers/player/handlePlayerWatchCraftBlock.ts"',
            '2026-11-08T22:10:23.114+07:00 ERROR script.failed v=1 run="c843726b-ad35-4ede-8ae0-83a7f9d5db28" seq=157 category="system" error_message="\\"EocHudApi\\" is not defined" error_name="ReferenceError" operation="main" player="Kiras" player_uuid="bda71d53-e4e9-47a4-a6c6-7cfd0c08acab" source="handlers/player/handlePlayerWatchCraftBlock.ts" stack="ReferenceError: \\"EocHudApi\\" is not defined\\n\\tat _loop_1 (handlers/player/handlePlayerWatchCraftBlock.js:4112)\\n\\tat syncPotionEffectIndicators (handlers/player/handlePlayerWatchCraftBlock.js:4123)\\n\\tat processPotionEffects (handlers/player/handlePlayerWatchCraftBlock.js:3907)\\n\\tat main (handlers/player/handlePlayerWatchCraftBlock.js:6989)"',
            '2026-11-08T22:10:52.126+07:00 ERROR script.failed.repeated v=1 run="c843726b-ad35-4ede-8ae0-83a7f9d5db28" seq=189 category="system" count=29 error_message="\\"EocHudApi\\" is not defined" error_name="ReferenceError" first_at="2026-11-08T22:10:23.114+07:00" last_at="2026-11-08T22:10:52.126+07:00" operation="main" player="Kiras" player_uuid="bda71d53-e4e9-47a4-a6c6-7cfd0c08acab" source="handlers/player/handlePlayerWatchCraftBlock.ts"',
            '2026-11-08T22:10:53.125+07:00 ERROR script.failed v=1 run="c843726b-ad35-4ede-8ae0-83a7f9d5db28" seq=188 category="system" error_message="\\"EocHudApi\\" is not defined" error_name="ReferenceError" operation="main" player="Kiras" player_uuid="bda71d53-e4e9-47a4-a6c6-7cfd0c08acab" source="handlers/player/handlePlayerWatchCraftBlock.ts" stack="ReferenceError: \\"EocHudApi\\" is not defined\\n\\tat _loop_1 (handlers/player/handlePlayerWatchCraftBlock.js:4112)\\n\\tat syncPotionEffectIndicators (handlers/player/handlePlayerWatchCraftBlock.js:4123)\\n\\tat processPotionEffects (handlers/player/handlePlayerWatchCraftBlock.js:3907)\\n\\tat main (handlers/player/handlePlayerWatchCraftBlock.js:6989)"',
            '2026-11-08T22:11:22.139+07:00 ERROR script.failed.repeated v=1 run="c843726b-ad35-4ede-8ae0-83a7f9d5db28" seq=220 category="system" count=29 error_message="\\"EocHudApi\\" is not defined" error_name="ReferenceError" first_at="2026-11-08T22:10:53.125+07:00" last_at="2026-11-08T22:11:22.139+07:00" operation="main" player="Kiras" player_uuid="bda71d53-e4e9-47a4-a6c6-7cfd0c08acab" source="handlers/player/handlePlayerWatchCraftBlock.ts"',
            '2026-11-08T22:11:23.137+07:00 ERROR script.failed v=1 run="c843726b-ad35-4ede-8ae0-83a7f9d5db28" seq=219 category="system" error_message="\\"EocHudApi\\" is not defined" error_name="ReferenceError" operation="main" player="Kiras" player_uuid="bda71d53-e4e9-47a4-a6c6-7cfd0c08acab" source="handlers/player/handlePlayerWatchCraftBlock.ts" stack="ReferenceError: \\"EocHudApi\\" is not defined\\n\\tat _loop_1 (handlers/player/handlePlayerWatchCraftBlock.js:4112)\\n\\tat syncPotionEffectIndicators (handlers/player/handlePlayerWatchCraftBlock.js:4123)\\n\\tat processPotionEffects (handlers/player/handlePlayerWatchCraftBlock.js:3907)\\n\\tat main (handlers/player/handlePlayerWatchCraftBlock.js:6989)"',
            '2026-11-08T22:11:27.139+07:00 ERROR script.failed.repeated v=1 run="c843726b-ad35-4ede-8ae0-83a7f9d5db28" seq=225 category="system" count=4 error_message="\\"EocHudApi\\" is not defined" error_name="ReferenceError" first_at="2026-11-08T22:11:23.137+07:00" last_at="2026-11-08T22:11:27.139+07:00" operation="main" player="Kiras" player_uuid="bda71d53-e4e9-47a4-a6c6-7cfd0c08acab" source="handlers/player/handlePlayerWatchCraftBlock.ts"',
        ],
    },
    {
        category: ELogCategory.Checks,
        name: '2026-11-10.001.log',
        modifiedAt: '2026-11-09T18:59:32.933Z',
        combatUuid: null,
        lines: [
            '2026-11-10T01:59:32.933+07:00 INFO skill.check.resolved category="checks" message="Проверка навыка" check_name="Изготовление предмета" outcome_name="провал" check_type="craft" difficulty=19 item_id="eoc:butcher_knife" outcome="failure" param=1 param_key="craft" player="iora" player_uuid="7680283b-19af-451b-84b8-5fe3dffa603c" result=6 roll=4 skill=1 skill_key="blacksmithing" success=false',
        ],
    },
    {
        category: ELogCategory.Checks,
        name: '2026-11-12.001.log',
        modifiedAt: '2026-11-11T17:32:54.237Z',
        combatUuid: null,
        lines: [
            '2026-11-12T00:32:54.228+07:00 INFO skill.check.resolved category="checks" message="Проверка навыка" check_name="Инициатива" outcome_name="числовой результат без проходного порога" check_type="combat.initiative" outcome="value" param=10 param_key="reaction" player="Kiras" player_uuid="bda71d53-e4e9-47a4-a6c6-7cfd0c08acab" result=21 roll=11 skill=0 success=null',
            '2026-11-12T00:32:54.237+07:00 INFO skill.check.resolved category="checks" message="Проверка навыка" check_name="Инициатива" outcome_name="числовой результат без проходного порога" check_type="combat.initiative" outcome="value" param=5 param_key="reaction" player="iora" player_uuid="7680283b-19af-451b-84b8-5fe3dffa603c" result=22 roll=17 skill=0 success=null',
        ],
    },
    {
        category: ELogCategory.Checks,
        name: '2026-11-12.002.log',
        modifiedAt: '2026-11-11T17:35:55.853Z',
        combatUuid: null,
        lines: [
            '2026-11-12T00:35:55.847+07:00 INFO skill.check.resolved category="checks" message="Проверка навыка" check_name="Атака" outcome_name="ничья, повторная проверка" action_id="46290e50-7cea-4e6a-96f2-830af7011208" actor_uuid="bda71d53-e4e9-47a4-a6c6-7cfd0c08acab" attempt=1 bonus=0 check_type="combat.attack" combat="146595ac-fb68-45a8-b427-f7bd98af4368" difficulty=15 item_id="eoc:crossbow" modifier=-2 outcome="tie" param=1 player="Kiras" player_uuid="bda71d53-e4e9-47a4-a6c6-7cfd0c08acab" result=15 roll=15 round=2 skill=1 skill_key="shooting" success=null turn_id="1e1f2328-26b0-4493-a413-35f585c54d37"',
            '2026-11-12T00:35:55.851+07:00 INFO skill.check.resolved category="checks" message="Проверка навыка" check_name="Уклонение" outcome_name="ничья, повторная проверка" action_id="46290e50-7cea-4e6a-96f2-830af7011208" actor_uuid="bda71d53-e4e9-47a4-a6c6-7cfd0c08acab" attempt=1 check_type="combat.evasion" combat="146595ac-fb68-45a8-b427-f7bd98af4368" difficulty=15 modifier=0 outcome="tie" param=5 player="iora" player_uuid="7680283b-19af-451b-84b8-5fe3dffa603c" result=15 roll=9 round=2 skill=1 skill_key="evasion" success=null turn_id="1e1f2328-26b0-4493-a413-35f585c54d37"',
            '2026-11-12T00:35:55.852+07:00 INFO skill.check.resolved category="checks" message="Проверка навыка" check_name="Атака" outcome_name="провал" action_id="46290e50-7cea-4e6a-96f2-830af7011208" actor_uuid="bda71d53-e4e9-47a4-a6c6-7cfd0c08acab" attempt=2 bonus=0 check_type="combat.attack" combat="146595ac-fb68-45a8-b427-f7bd98af4368" difficulty=16 item_id="eoc:crossbow" modifier=-2 outcome="failure" param=1 player="Kiras" player_uuid="bda71d53-e4e9-47a4-a6c6-7cfd0c08acab" result=5 roll=5 round=2 skill=1 skill_key="shooting" success=false turn_id="1e1f2328-26b0-4493-a413-35f585c54d37"',
            '2026-11-12T00:35:55.853+07:00 INFO skill.check.resolved category="checks" message="Проверка навыка" check_name="Уклонение" outcome_name="успех" action_id="46290e50-7cea-4e6a-96f2-830af7011208" actor_uuid="bda71d53-e4e9-47a4-a6c6-7cfd0c08acab" attempt=2 check_type="combat.evasion" combat="146595ac-fb68-45a8-b427-f7bd98af4368" difficulty=5 modifier=0 outcome="success" param=5 player="iora" player_uuid="7680283b-19af-451b-84b8-5fe3dffa603c" result=16 roll=10 round=2 skill=1 skill_key="evasion" success=true turn_id="1e1f2328-26b0-4493-a413-35f585c54d37"',
        ],
    },
    {
        category: ELogCategory.Combat,
        name: '146595ac-fb68-45a8-b427-f7bd98af4368.log',
        modifiedAt: '2026-11-11T18:08:29.662Z',
        combatUuid: '146595ac-fb68-45a8-b427-f7bd98af4368',
        lines: [
            '2026-11-12T00:32:54.309+07:00 INFO combat.created category="combat" message="Создан бой" actor="Kiras" actor_uuid="bda71d53-e4e9-47a4-a6c6-7cfd0c08acab" combat="146595ac-fb68-45a8-b427-f7bd98af4368" count=2 dimension=0 members="[{\\"uuid\\":\\"bda71d53-e4e9-47a4-a6c6-7cfd0c08acab\\",\\"name\\":\\"Kiras\\",\\"initiative\\":21},{\\"uuid\\":\\"7680283b-19af-451b-84b8-5fe3dffa603c\\",\\"name\\":\\"iora\\",\\"initiative\\":22}]" radius=5 round=0 target="iora" target_uuid="7680283b-19af-451b-84b8-5fe3dffa603c" x=-153 y=114 z=1155',
            '2026-11-12T00:32:54.430+07:00 INFO combat.started category="combat" message="Бой начат" combat="146595ac-fb68-45a8-b427-f7bd98af4368" count=2 order="[{\\"uuid\\":\\"7680283b-19af-451b-84b8-5fe3dffa603c\\",\\"name\\":\\"iora\\",\\"initiative\\":22},{\\"uuid\\":\\"bda71d53-e4e9-47a4-a6c6-7cfd0c08acab\\",\\"name\\":\\"Kiras\\",\\"initiative\\":21}]" round=1',
            '2026-11-12T00:32:54.432+07:00 INFO combat.round.started category="combat" message="Начат раунд" combat="146595ac-fb68-45a8-b427-f7bd98af4368" reason="бой начат" round=1',
            '2026-11-12T00:32:54.482+07:00 INFO combat.turn.started category="combat" message="Начат ход" actor_uuid="7680283b-19af-451b-84b8-5fe3dffa603c" combat="146595ac-fb68-45a8-b427-f7bd98af4368" round=1 turn_id="42346dbb-106d-40d9-8c76-29bb14c5b8bc"',
            '2026-11-12T00:33:12.123+07:00 INFO combat.equipment.changed category="combat" message="Изменено снаряжение" actor="iora" actor_uuid="7680283b-19af-451b-84b8-5fe3dffa603c" combat="146595ac-fb68-45a8-b427-f7bd98af4368" hand="вторая рука" item_id="eoc:weak_healing_potion" item_name="Слабое зелье лечения" phase="combat" round=1 turn_id="42346dbb-106d-40d9-8c76-29bb14c5b8bc"',
            '2026-11-12T00:33:54.896+07:00 INFO combat.turn.finished category="combat" message="Ход завершён" action=null actor_uuid="7680283b-19af-451b-84b8-5fe3dffa603c" combat="146595ac-fb68-45a8-b427-f7bd98af4368" equipment_changes="[]" movement_spent=false reason="истекло время или участник отключился" round=1 turn_id="42346dbb-106d-40d9-8c76-29bb14c5b8bc"',
            '2026-11-12T00:33:54.903+07:00 INFO combat.turn.started category="combat" message="Начат ход" actor_uuid="bda71d53-e4e9-47a4-a6c6-7cfd0c08acab" combat="146595ac-fb68-45a8-b427-f7bd98af4368" round=1 turn_id="dcfcb47c-c8e1-459c-a717-b0444ed538b7"',
            '2026-11-12T00:34:21.624+07:00 INFO combat.equipment.changed message="Изменено снаряжение" action_id="392f14c6-754d-4032-be20-0ad93c0e8b95" actor="Kiras" actor_uuid="bda71d53-e4e9-47a4-a6c6-7cfd0c08acab" category="оружие" combat="146595ac-fb68-45a8-b427-f7bd98af4368" hand="основная рука" item_id="eoc:crossbow" item_name="Тяжёлый арбалет" phase="combat" previous_item_id="eoc:iron_sword" previous_item_name="Железный меч" readiness="не готов" round=1 turn_id="dcfcb47c-c8e1-459c-a717-b0444ed538b7"',
            '2026-11-12T00:34:21.629+07:00 INFO combat.action.resolved category="combat" message="Выполнено действие" action="смена снаряжения" action_id="392f14c6-754d-4032-be20-0ad93c0e8b95" actor="Kiras" actor_uuid="bda71d53-e4e9-47a4-a6c6-7cfd0c08acab" combat="146595ac-fb68-45a8-b427-f7bd98af4368" result="принято" round=1 turn_id="dcfcb47c-c8e1-459c-a717-b0444ed538b7"',
            '2026-11-12T00:34:21.646+07:00 INFO combat.equipment.changed message="Изменено снаряжение" action_id="392f14c6-754d-4032-be20-0ad93c0e8b95" actor="Kiras" actor_uuid="bda71d53-e4e9-47a4-a6c6-7cfd0c08acab" category="щит" combat="146595ac-fb68-45a8-b427-f7bd98af4368" hand="вторая рука" item_id="eoc:weak_healing_potion" item_name="Слабое зелье лечения" phase="combat" previous_item_id="eoc:leather_shield" previous_item_name="Кожаный щит" readiness="пусто" round=1 turn_id="dcfcb47c-c8e1-459c-a717-b0444ed538b7"',
            '2026-11-12T00:34:21.647+07:00 INFO combat.equipment.changed message="Изменено снаряжение" action_id="392f14c6-754d-4032-be20-0ad93c0e8b95" actor="Kiras" actor_uuid="bda71d53-e4e9-47a4-a6c6-7cfd0c08acab" category="шлем" combat="146595ac-fb68-45a8-b427-f7bd98af4368" item_id="eoc:iron_helmet" item_name="Железный шлем" phase="combat" readiness="не готов" round=1 turn_id="dcfcb47c-c8e1-459c-a717-b0444ed538b7"',
            '2026-11-12T00:34:27.507+07:00 INFO combat.turn.finished category="combat" message="Ход завершён" action="смена снаряжения" action_id="392f14c6-754d-4032-be20-0ad93c0e8b95" actor_uuid="bda71d53-e4e9-47a4-a6c6-7cfd0c08acab" combat="146595ac-fb68-45a8-b427-f7bd98af4368" equipment_changes="[\\"weapon\\",\\"shield\\",\\"helmet\\"]" movement_spent=false reason="завершён досрочно" round=1 turn_id="dcfcb47c-c8e1-459c-a717-b0444ed538b7"',
            '2026-11-12T00:34:27.524+07:00 INFO combat.round.started category="combat" message="Начат раунд" action_id="392f14c6-754d-4032-be20-0ad93c0e8b95" combat="146595ac-fb68-45a8-b427-f7bd98af4368" reason="завершён круг ходов" round=2 turn_id="dcfcb47c-c8e1-459c-a717-b0444ed538b7"',
            '2026-11-12T00:34:27.555+07:00 INFO combat.turn.started category="combat" message="Начат ход" actor_uuid="7680283b-19af-451b-84b8-5fe3dffa603c" combat="146595ac-fb68-45a8-b427-f7bd98af4368" round=2 turn_id="ecabd11d-2969-44b7-b9db-6df7ca2fe6ab"',
            '2026-11-12T00:35:27.925+07:00 INFO combat.turn.finished category="combat" message="Ход завершён" action=null actor_uuid="7680283b-19af-451b-84b8-5fe3dffa603c" combat="146595ac-fb68-45a8-b427-f7bd98af4368" equipment_changes="[]" movement_spent=false reason="истекло время или участник отключился" round=2 turn_id="ecabd11d-2969-44b7-b9db-6df7ca2fe6ab"',
            '2026-11-12T00:35:27.946+07:00 INFO combat.turn.started category="combat" message="Начат ход" actor_uuid="bda71d53-e4e9-47a4-a6c6-7cfd0c08acab" combat="146595ac-fb68-45a8-b427-f7bd98af4368" round=2 turn_id="1e1f2328-26b0-4493-a413-35f585c54d37"',
            '2026-11-12T00:35:45.115+07:00 INFO combat.attack.started category="combat" message="Объявлена атака" action_id="46290e50-7cea-4e6a-96f2-830af7011208" actor="Kiras" actor_uuid="bda71d53-e4e9-47a4-a6c6-7cfd0c08acab" combat="146595ac-fb68-45a8-b427-f7bd98af4368" hand="основная рука" item="eoc:crossbow" lethal=true round=2 selected_body_part="тело" target="iora" target_uuid="7680283b-19af-451b-84b8-5fe3dffa603c" turn_id="1e1f2328-26b0-4493-a413-35f585c54d37" weapon="§rТяжёлый арбалет"',
            '2026-11-12T00:35:45.131+07:00 INFO combat.action.resolved category="combat" message="Выполнено действие" action="атака" action_id="46290e50-7cea-4e6a-96f2-830af7011208" actor="Kiras" actor_uuid="bda71d53-e4e9-47a4-a6c6-7cfd0c08acab" combat="146595ac-fb68-45a8-b427-f7bd98af4368" result="принято" round=2 turn_id="1e1f2328-26b0-4493-a413-35f585c54d37"',
            '2026-11-12T00:35:55.880+07:00 INFO combat.equipment.worn category="combat" message="Изношено снаряжение" action_id="46290e50-7cea-4e6a-96f2-830af7011208" actor="Kiras" actor_uuid="bda71d53-e4e9-47a4-a6c6-7cfd0c08acab" broken=false category="основная рука" combat="146595ac-fb68-45a8-b427-f7bd98af4368" item="eoc:crossbow" remaining=44 round=2 turn_id="1e1f2328-26b0-4493-a413-35f585c54d37" wear="durability"',
            '2026-11-12T00:35:55.902+07:00 INFO combat.attack.resolved category="combat" message="Атака завершена" absorbed_damage=0 action_id="46290e50-7cea-4e6a-96f2-830af7011208" actor_uuid="bda71d53-e4e9-47a4-a6c6-7cfd0c08acab" attack_check=5 attack_penalty=-2 body_part="тело" combat="146595ac-fb68-45a8-b427-f7bd98af4368" damage=0 damage_modifier=1 defense="уклонение" defense_bonus=0 defense_check=16 hand="основная рука" hit=false item="eoc:crossbow" poisoned=false queued=false raw_damage=0 result="рассчитано" round=2 selected_body_part="тело" target_uuid="7680283b-19af-451b-84b8-5fe3dffa603c" timeout=true turn_id="1e1f2328-26b0-4493-a413-35f585c54d37" weapon="§rТяжёлый арбалет"',
            '2026-11-12T00:35:55.928+07:00 INFO combat.turn.paused category="combat" message="Ход приостановлен" action_id="46290e50-7cea-4e6a-96f2-830af7011208" combat="146595ac-fb68-45a8-b427-f7bd98af4368" duration_ms=4000 reason="атака" round=2 turn_id="1e1f2328-26b0-4493-a413-35f585c54d37"',
            '2026-11-12T00:36:01.239+07:00 INFO combat.turn.resumed category="combat" message="Ход возобновлён" action_id="46290e50-7cea-4e6a-96f2-830af7011208" actor_uuid="bda71d53-e4e9-47a4-a6c6-7cfd0c08acab" combat="146595ac-fb68-45a8-b427-f7bd98af4368" reason="пауза завершена" round=2 turn_id="1e1f2328-26b0-4493-a413-35f585c54d37"',
            '2026-11-12T00:36:32.331+07:00 INFO combat.turn.finished category="combat" message="Ход завершён" action="атака" action_id="46290e50-7cea-4e6a-96f2-830af7011208" actor_uuid="bda71d53-e4e9-47a4-a6c6-7cfd0c08acab" combat="146595ac-fb68-45a8-b427-f7bd98af4368" equipment_changes="[]" movement_spent=true reason="движение и действие израсходованы" round=2 turn_id="1e1f2328-26b0-4493-a413-35f585c54d37"',
            '2026-11-12T00:36:32.333+07:00 INFO combat.round.started category="combat" message="Начат раунд" action_id="46290e50-7cea-4e6a-96f2-830af7011208" combat="146595ac-fb68-45a8-b427-f7bd98af4368" reason="завершён круг ходов" round=3 turn_id="1e1f2328-26b0-4493-a413-35f585c54d37"',
            '2026-11-12T00:36:32.336+07:00 INFO combat.turn.started category="combat" message="Начат ход" actor_uuid="7680283b-19af-451b-84b8-5fe3dffa603c" combat="146595ac-fb68-45a8-b427-f7bd98af4368" round=3 turn_id="39d1b78f-7616-412b-998b-15f111c8171f"',
            '2026-11-12T00:37:32.604+07:00 INFO combat.turn.finished category="combat" message="Ход завершён" action=null actor_uuid="7680283b-19af-451b-84b8-5fe3dffa603c" combat="146595ac-fb68-45a8-b427-f7bd98af4368" equipment_changes="[]" movement_spent=false reason="истекло время или участник отключился" round=3 turn_id="39d1b78f-7616-412b-998b-15f111c8171f"',
            '2026-11-12T00:37:32.607+07:00 INFO combat.turn.started category="combat" message="Начат ход" actor_uuid="bda71d53-e4e9-47a4-a6c6-7cfd0c08acab" combat="146595ac-fb68-45a8-b427-f7bd98af4368" round=3 turn_id="d2d43f65-e056-45ad-810d-da45778b4ee8"',
            '2026-11-12T00:38:32.867+07:00 INFO combat.turn.finished category="combat" message="Ход завершён" action=null actor_uuid="bda71d53-e4e9-47a4-a6c6-7cfd0c08acab" combat="146595ac-fb68-45a8-b427-f7bd98af4368" equipment_changes="[]" movement_spent=false reason="истекло время или участник отключился" round=3 turn_id="d2d43f65-e056-45ad-810d-da45778b4ee8"',
            '2026-11-12T00:38:32.870+07:00 INFO combat.round.started category="combat" message="Начат раунд" combat="146595ac-fb68-45a8-b427-f7bd98af4368" reason="завершён круг ходов" round=4 turn_id="d2d43f65-e056-45ad-810d-da45778b4ee8"',
            '2026-11-12T00:38:32.872+07:00 INFO combat.turn.started category="combat" message="Начат ход" actor_uuid="7680283b-19af-451b-84b8-5fe3dffa603c" combat="146595ac-fb68-45a8-b427-f7bd98af4368" round=4 turn_id="09363221-1d07-46cf-80a5-1f3af27077e0"',
            '2026-11-12T00:39:33.122+07:00 INFO combat.turn.finished category="combat" message="Ход завершён" action=null actor_uuid="7680283b-19af-451b-84b8-5fe3dffa603c" combat="146595ac-fb68-45a8-b427-f7bd98af4368" equipment_changes="[]" movement_spent=false reason="истекло время или участник отключился" round=4 turn_id="09363221-1d07-46cf-80a5-1f3af27077e0"',
            '2026-11-12T00:39:33.126+07:00 INFO combat.turn.started category="combat" message="Начат ход" actor_uuid="bda71d53-e4e9-47a4-a6c6-7cfd0c08acab" combat="146595ac-fb68-45a8-b427-f7bd98af4368" round=4 turn_id="383a993c-0913-4e40-9ce1-3ec33d52eac3"',
            '2026-11-12T00:39:49.025+07:00 INFO combat.equipment.changed category="combat" message="Изменено снаряжение" actor="Kiras" actor_uuid="bda71d53-e4e9-47a4-a6c6-7cfd0c08acab" category="оружие" combat="146595ac-fb68-45a8-b427-f7bd98af4368" readiness="пусто" round=4 turn_id="383a993c-0913-4e40-9ce1-3ec33d52eac3"',
            '2026-11-12T00:39:49.027+07:00 INFO combat.equipment.changed category="combat" message="Изменено снаряжение" actor="Kiras" actor_uuid="bda71d53-e4e9-47a4-a6c6-7cfd0c08acab" category="щит" combat="146595ac-fb68-45a8-b427-f7bd98af4368" readiness="пусто" round=4 turn_id="383a993c-0913-4e40-9ce1-3ec33d52eac3"',
            '2026-11-12T00:39:53.712+07:00 INFO combat.action.resolved category="combat" message="Выполнено действие" action="зелье" action_id="1ad3d013-0175-4e7d-830b-f1ee573af28e" actor="Kiras" actor_uuid="bda71d53-e4e9-47a4-a6c6-7cfd0c08acab" combat="146595ac-fb68-45a8-b427-f7bd98af4368" result="принято" round=4 turn_id="383a993c-0913-4e40-9ce1-3ec33d52eac3"',
            '2026-11-12T00:39:53.731+07:00 INFO combat.potion.resolved category="combat" message="Использовано зелье" action_id="1ad3d013-0175-4e7d-830b-f1ee573af28e" action_spent=true actor="Kiras" actor_uuid="bda71d53-e4e9-47a4-a6c6-7cfd0c08acab" combat="146595ac-fb68-45a8-b427-f7bd98af4368" consumed=1 hand="основная рука" healing=0 hp_after=102 hp_before=102 item="eoc:warrior_blood_potion" queued=false result="применено" round=4 stage="завершено" target="Kiras" target_uuid="bda71d53-e4e9-47a4-a6c6-7cfd0c08acab" turn_id="383a993c-0913-4e40-9ce1-3ec33d52eac3"',
            '2026-11-12T00:39:53.735+07:00 INFO combat.equipment.changed category="combat" message="Изменено снаряжение" action_id="1ad3d013-0175-4e7d-830b-f1ee573af28e" actor="Kiras" actor_uuid="bda71d53-e4e9-47a4-a6c6-7cfd0c08acab" category="оружие" combat="146595ac-fb68-45a8-b427-f7bd98af4368" readiness="пусто" round=4 turn_id="383a993c-0913-4e40-9ce1-3ec33d52eac3"',
            '2026-11-12T00:39:53.737+07:00 INFO combat.equipment.changed category="combat" message="Изменено снаряжение" action_id="1ad3d013-0175-4e7d-830b-f1ee573af28e" actor="Kiras" actor_uuid="bda71d53-e4e9-47a4-a6c6-7cfd0c08acab" category="щит" combat="146595ac-fb68-45a8-b427-f7bd98af4368" readiness="пусто" round=4 turn_id="383a993c-0913-4e40-9ce1-3ec33d52eac3"',
            '2026-11-12T00:40:33.351+07:00 INFO combat.turn.finished category="combat" message="Ход завершён" action="зелье" action_id="1ad3d013-0175-4e7d-830b-f1ee573af28e" actor_uuid="bda71d53-e4e9-47a4-a6c6-7cfd0c08acab" combat="146595ac-fb68-45a8-b427-f7bd98af4368" equipment_changes="[\\"weapon\\",\\"shield\\"]" movement_spent=false reason="истекло время или участник отключился" round=4 turn_id="383a993c-0913-4e40-9ce1-3ec33d52eac3"',
            '2026-11-12T00:40:33.353+07:00 INFO combat.round.started category="combat" message="Начат раунд" action_id="1ad3d013-0175-4e7d-830b-f1ee573af28e" combat="146595ac-fb68-45a8-b427-f7bd98af4368" reason="завершён круг ходов" round=5 turn_id="383a993c-0913-4e40-9ce1-3ec33d52eac3"',
            '2026-11-12T00:40:33.381+07:00 INFO combat.turn.started category="combat" message="Начат ход" actor_uuid="7680283b-19af-451b-84b8-5fe3dffa603c" combat="146595ac-fb68-45a8-b427-f7bd98af4368" round=5 turn_id="9d6cb333-1e17-4df2-9233-fbdef44fc969"',
            '2026-11-12T00:41:34.128+07:00 INFO combat.turn.finished category="combat" message="Ход завершён" action=null actor_uuid="7680283b-19af-451b-84b8-5fe3dffa603c" combat="146595ac-fb68-45a8-b427-f7bd98af4368" equipment_changes="[]" movement_spent=false reason="истекло время или участник отключился" round=5 turn_id="9d6cb333-1e17-4df2-9233-fbdef44fc969"',
            '2026-11-12T00:41:34.132+07:00 INFO combat.turn.started category="combat" message="Начат ход" actor_uuid="bda71d53-e4e9-47a4-a6c6-7cfd0c08acab" combat="146595ac-fb68-45a8-b427-f7bd98af4368" round=5 turn_id="a5cc804e-0126-4e89-8963-3ebff7e7c8e3"',
            '2026-11-12T00:42:34.367+07:00 INFO combat.turn.finished category="combat" message="Ход завершён" action=null actor_uuid="bda71d53-e4e9-47a4-a6c6-7cfd0c08acab" combat="146595ac-fb68-45a8-b427-f7bd98af4368" equipment_changes="[]" movement_spent=false reason="истекло время или участник отключился" round=5 turn_id="a5cc804e-0126-4e89-8963-3ebff7e7c8e3"',
            '2026-11-12T00:42:34.368+07:00 INFO combat.round.started category="combat" message="Начат раунд" combat="146595ac-fb68-45a8-b427-f7bd98af4368" reason="завершён круг ходов" round=6 turn_id="a5cc804e-0126-4e89-8963-3ebff7e7c8e3"',
            '2026-11-12T00:42:34.371+07:00 INFO combat.turn.started category="combat" message="Начат ход" actor_uuid="7680283b-19af-451b-84b8-5fe3dffa603c" combat="146595ac-fb68-45a8-b427-f7bd98af4368" round=6 turn_id="ea901d07-017c-4823-a8f0-a539e02a315e"',
            '2026-11-12T00:43:34.571+07:00 INFO combat.turn.finished category="combat" message="Ход завершён" action=null actor_uuid="7680283b-19af-451b-84b8-5fe3dffa603c" combat="146595ac-fb68-45a8-b427-f7bd98af4368" equipment_changes="[]" movement_spent=false reason="истекло время или участник отключился" round=6 turn_id="ea901d07-017c-4823-a8f0-a539e02a315e"',
            '2026-11-12T00:43:34.574+07:00 INFO combat.turn.started category="combat" message="Начат ход" actor_uuid="bda71d53-e4e9-47a4-a6c6-7cfd0c08acab" combat="146595ac-fb68-45a8-b427-f7bd98af4368" round=6 turn_id="5ef75b42-2b81-4ae3-a2f6-c980c335e482"',
            '2026-11-12T00:44:34.794+07:00 INFO combat.turn.finished category="combat" message="Ход завершён" action=null actor_uuid="bda71d53-e4e9-47a4-a6c6-7cfd0c08acab" combat="146595ac-fb68-45a8-b427-f7bd98af4368" equipment_changes="[]" movement_spent=false reason="истекло время или участник отключился" round=6 turn_id="5ef75b42-2b81-4ae3-a2f6-c980c335e482"',
            '2026-11-12T00:44:34.796+07:00 INFO combat.round.started category="combat" message="Начат раунд" combat="146595ac-fb68-45a8-b427-f7bd98af4368" reason="завершён круг ходов" round=7 turn_id="5ef75b42-2b81-4ae3-a2f6-c980c335e482"',
            '2026-11-12T00:44:34.799+07:00 INFO combat.turn.started category="combat" message="Начат ход" actor_uuid="7680283b-19af-451b-84b8-5fe3dffa603c" combat="146595ac-fb68-45a8-b427-f7bd98af4368" round=7 turn_id="00e9dd4f-ceb8-40d8-b15b-2c06d00063a8"',
            '2026-11-12T00:45:35.507+07:00 INFO combat.turn.finished category="combat" message="Ход завершён" action=null actor_uuid="7680283b-19af-451b-84b8-5fe3dffa603c" combat="146595ac-fb68-45a8-b427-f7bd98af4368" equipment_changes="[]" movement_spent=false reason="истекло время или участник отключился" round=7 turn_id="00e9dd4f-ceb8-40d8-b15b-2c06d00063a8"',
            '2026-11-12T00:45:35.510+07:00 INFO combat.turn.started category="combat" message="Начат ход" actor_uuid="bda71d53-e4e9-47a4-a6c6-7cfd0c08acab" combat="146595ac-fb68-45a8-b427-f7bd98af4368" round=7 turn_id="c76d0cf3-fa44-46e7-9c5f-c87282041d17"',
            '2026-11-12T00:46:35.730+07:00 INFO combat.turn.finished category="combat" message="Ход завершён" action=null actor_uuid="bda71d53-e4e9-47a4-a6c6-7cfd0c08acab" combat="146595ac-fb68-45a8-b427-f7bd98af4368" equipment_changes="[]" movement_spent=false reason="истекло время или участник отключился" round=7 turn_id="c76d0cf3-fa44-46e7-9c5f-c87282041d17"',
            '2026-11-12T00:46:35.733+07:00 INFO combat.round.started category="combat" message="Начат раунд" combat="146595ac-fb68-45a8-b427-f7bd98af4368" reason="завершён круг ходов" round=8 turn_id="c76d0cf3-fa44-46e7-9c5f-c87282041d17"',
            '2026-11-12T00:46:35.736+07:00 INFO combat.turn.started category="combat" message="Начат ход" actor_uuid="7680283b-19af-451b-84b8-5fe3dffa603c" combat="146595ac-fb68-45a8-b427-f7bd98af4368" round=8 turn_id="cd24b367-c2a8-458d-8a05-e2373ed52415"',
            '2026-11-12T00:47:35.913+07:00 INFO combat.turn.finished category="combat" message="Ход завершён" action=null actor_uuid="7680283b-19af-451b-84b8-5fe3dffa603c" combat="146595ac-fb68-45a8-b427-f7bd98af4368" equipment_changes="[]" movement_spent=false reason="истекло время или участник отключился" round=8 turn_id="cd24b367-c2a8-458d-8a05-e2373ed52415"',
            '2026-11-12T00:47:35.918+07:00 INFO combat.turn.started category="combat" message="Начат ход" actor_uuid="bda71d53-e4e9-47a4-a6c6-7cfd0c08acab" combat="146595ac-fb68-45a8-b427-f7bd98af4368" round=8 turn_id="b71e50c1-bff3-4bbe-910e-1b07d7ed48ef"',
            '2026-11-12T00:48:36.184+07:00 INFO combat.turn.finished category="combat" message="Ход завершён" action=null actor_uuid="bda71d53-e4e9-47a4-a6c6-7cfd0c08acab" combat="146595ac-fb68-45a8-b427-f7bd98af4368" equipment_changes="[]" movement_spent=true reason="истекло время или участник отключился" round=8 turn_id="b71e50c1-bff3-4bbe-910e-1b07d7ed48ef"',
            '2026-11-12T00:48:36.186+07:00 INFO combat.round.started category="combat" message="Начат раунд" combat="146595ac-fb68-45a8-b427-f7bd98af4368" reason="завершён круг ходов" round=9 turn_id="b71e50c1-bff3-4bbe-910e-1b07d7ed48ef"',
            '2026-11-12T00:48:36.189+07:00 INFO combat.turn.started category="combat" message="Начат ход" actor_uuid="7680283b-19af-451b-84b8-5fe3dffa603c" combat="146595ac-fb68-45a8-b427-f7bd98af4368" round=9 turn_id="0184567a-85b6-4313-b8df-38b3599a6ef7"',
            '2026-11-12T00:49:36.397+07:00 INFO combat.turn.finished category="combat" message="Ход завершён" action=null actor_uuid="7680283b-19af-451b-84b8-5fe3dffa603c" combat="146595ac-fb68-45a8-b427-f7bd98af4368" equipment_changes="[]" movement_spent=false reason="истекло время или участник отключился" round=9 turn_id="0184567a-85b6-4313-b8df-38b3599a6ef7"',
            '2026-11-12T00:49:36.400+07:00 INFO combat.turn.started category="combat" message="Начат ход" actor_uuid="bda71d53-e4e9-47a4-a6c6-7cfd0c08acab" combat="146595ac-fb68-45a8-b427-f7bd98af4368" round=9 turn_id="a69b3dbf-ea6f-47fd-9d1e-57e26cecd492"',
            '2026-11-12T00:50:36.659+07:00 INFO combat.turn.finished category="combat" message="Ход завершён" action=null actor_uuid="bda71d53-e4e9-47a4-a6c6-7cfd0c08acab" combat="146595ac-fb68-45a8-b427-f7bd98af4368" equipment_changes="[]" movement_spent=false reason="истекло время или участник отключился" round=9 turn_id="a69b3dbf-ea6f-47fd-9d1e-57e26cecd492"',
            '2026-11-12T00:50:36.661+07:00 INFO combat.round.started category="combat" message="Начат раунд" combat="146595ac-fb68-45a8-b427-f7bd98af4368" reason="завершён круг ходов" round=10 turn_id="a69b3dbf-ea6f-47fd-9d1e-57e26cecd492"',
            '2026-11-12T00:50:36.665+07:00 INFO combat.turn.started category="combat" message="Начат ход" actor_uuid="7680283b-19af-451b-84b8-5fe3dffa603c" combat="146595ac-fb68-45a8-b427-f7bd98af4368" round=10 turn_id="c13bc50d-a599-4680-95b2-8d493f97477a"',
            '2026-11-12T00:51:36.859+07:00 INFO combat.turn.finished category="combat" message="Ход завершён" action=null actor_uuid="7680283b-19af-451b-84b8-5fe3dffa603c" combat="146595ac-fb68-45a8-b427-f7bd98af4368" equipment_changes="[]" movement_spent=false reason="истекло время или участник отключился" round=10 turn_id="c13bc50d-a599-4680-95b2-8d493f97477a"',
            '2026-11-12T00:51:36.862+07:00 INFO combat.turn.started category="combat" message="Начат ход" actor_uuid="bda71d53-e4e9-47a4-a6c6-7cfd0c08acab" combat="146595ac-fb68-45a8-b427-f7bd98af4368" round=10 turn_id="c821a61f-a518-408c-a020-53dd76ac103c"',
            '2026-11-12T00:52:37.047+07:00 INFO combat.turn.finished category="combat" message="Ход завершён" action=null actor_uuid="bda71d53-e4e9-47a4-a6c6-7cfd0c08acab" combat="146595ac-fb68-45a8-b427-f7bd98af4368" equipment_changes="[]" movement_spent=false reason="истекло время или участник отключился" round=10 turn_id="c821a61f-a518-408c-a020-53dd76ac103c"',
            '2026-11-12T00:52:37.049+07:00 INFO combat.round.started category="combat" message="Начат раунд" combat="146595ac-fb68-45a8-b427-f7bd98af4368" reason="завершён круг ходов" round=11 turn_id="c821a61f-a518-408c-a020-53dd76ac103c"',
            '2026-11-12T00:52:37.053+07:00 INFO combat.turn.started category="combat" message="Начат ход" actor_uuid="7680283b-19af-451b-84b8-5fe3dffa603c" combat="146595ac-fb68-45a8-b427-f7bd98af4368" round=11 turn_id="f50930dd-8924-4877-a5f3-38903abe6dc7"',
            '2026-11-12T00:53:37.251+07:00 INFO combat.turn.finished category="combat" message="Ход завершён" action=null actor_uuid="7680283b-19af-451b-84b8-5fe3dffa603c" combat="146595ac-fb68-45a8-b427-f7bd98af4368" equipment_changes="[]" movement_spent=false reason="истекло время или участник отключился" round=11 turn_id="f50930dd-8924-4877-a5f3-38903abe6dc7"',
            '2026-11-12T00:53:37.254+07:00 INFO combat.turn.started category="combat" message="Начат ход" actor_uuid="bda71d53-e4e9-47a4-a6c6-7cfd0c08acab" combat="146595ac-fb68-45a8-b427-f7bd98af4368" round=11 turn_id="8730cf7d-68fe-4a64-917d-e7c1b816ba2b"',
            '2026-11-12T00:54:36.150+07:00 INFO combat.turn.finished category="combat" message="Ход завершён" action=null actor="Kiras" actor_uuid="bda71d53-e4e9-47a4-a6c6-7cfd0c08acab" combat="146595ac-fb68-45a8-b427-f7bd98af4368" equipment_changes="[]" movement_spent=false reason="завершён досрочно" round=11 turn_id="8730cf7d-68fe-4a64-917d-e7c1b816ba2b"',
            '2026-11-12T00:54:36.179+07:00 INFO combat.round.started category="combat" message="Начат раунд" combat="146595ac-fb68-45a8-b427-f7bd98af4368" reason="завершён круг ходов" round=12 turn_id="8730cf7d-68fe-4a64-917d-e7c1b816ba2b"',
            '2026-11-12T00:54:36.255+07:00 INFO combat.turn.started category="combat" message="Начат ход" actor="iora" actor_uuid="7680283b-19af-451b-84b8-5fe3dffa603c" combat="146595ac-fb68-45a8-b427-f7bd98af4368" round=12 turn_id="f44e9c42-c8aa-4abd-88e6-826788273e26"',
            '2026-11-12T00:55:37.270+07:00 INFO combat.turn.finished category="combat" message="Ход завершён" action=null actor="iora" actor_uuid="7680283b-19af-451b-84b8-5fe3dffa603c" combat="146595ac-fb68-45a8-b427-f7bd98af4368" equipment_changes="[]" movement_spent=false reason="истекло время или участник отключился" round=12 turn_id="f44e9c42-c8aa-4abd-88e6-826788273e26"',
            '2026-11-12T00:55:37.274+07:00 INFO combat.turn.started category="combat" message="Начат ход" actor="Kiras" actor_uuid="bda71d53-e4e9-47a4-a6c6-7cfd0c08acab" combat="146595ac-fb68-45a8-b427-f7bd98af4368" round=12 turn_id="1fc10eb3-84e7-4243-9d48-f9988fbdabe0"',
            '2026-11-12T00:56:37.533+07:00 INFO combat.turn.finished category="combat" message="Ход завершён" action=null actor="Kiras" actor_uuid="bda71d53-e4e9-47a4-a6c6-7cfd0c08acab" combat="146595ac-fb68-45a8-b427-f7bd98af4368" equipment_changes="[]" movement_spent=false reason="истекло время или участник отключился" round=12 turn_id="1fc10eb3-84e7-4243-9d48-f9988fbdabe0"',
            '2026-11-12T00:56:37.535+07:00 INFO combat.round.started category="combat" message="Начат раунд" combat="146595ac-fb68-45a8-b427-f7bd98af4368" reason="завершён круг ходов" round=13 turn_id="1fc10eb3-84e7-4243-9d48-f9988fbdabe0"',
            '2026-11-12T00:56:37.564+07:00 INFO combat.turn.started category="combat" message="Начат ход" actor="iora" actor_uuid="7680283b-19af-451b-84b8-5fe3dffa603c" combat="146595ac-fb68-45a8-b427-f7bd98af4368" round=13 turn_id="6ada3797-e870-42e6-a3b2-744f50bee6b1"',
            '2026-11-12T00:57:38.601+07:00 INFO combat.turn.finished category="combat" message="Ход завершён" action=null actor="iora" actor_uuid="7680283b-19af-451b-84b8-5fe3dffa603c" combat="146595ac-fb68-45a8-b427-f7bd98af4368" equipment_changes="[]" movement_spent=false reason="истекло время или участник отключился" round=13 turn_id="6ada3797-e870-42e6-a3b2-744f50bee6b1"',
            '2026-11-12T00:57:38.604+07:00 INFO combat.turn.started category="combat" message="Начат ход" actor="Kiras" actor_uuid="bda71d53-e4e9-47a4-a6c6-7cfd0c08acab" combat="146595ac-fb68-45a8-b427-f7bd98af4368" round=13 turn_id="d6d6f9e3-74af-4105-a44f-a35b41f63f1b"',
            '2026-11-12T00:58:38.876+07:00 INFO combat.turn.finished category="combat" message="Ход завершён" action=null actor="Kiras" actor_uuid="bda71d53-e4e9-47a4-a6c6-7cfd0c08acab" combat="146595ac-fb68-45a8-b427-f7bd98af4368" equipment_changes="[]" movement_spent=false reason="истекло время или участник отключился" round=13 turn_id="d6d6f9e3-74af-4105-a44f-a35b41f63f1b"',
            '2026-11-12T00:58:38.878+07:00 INFO combat.round.started category="combat" message="Начат раунд" combat="146595ac-fb68-45a8-b427-f7bd98af4368" reason="завершён круг ходов" round=14 turn_id="d6d6f9e3-74af-4105-a44f-a35b41f63f1b"',
            '2026-11-12T00:58:38.882+07:00 INFO combat.turn.started category="combat" message="Начат ход" actor="iora" actor_uuid="7680283b-19af-451b-84b8-5fe3dffa603c" combat="146595ac-fb68-45a8-b427-f7bd98af4368" round=14 turn_id="bb4d8b49-c1ee-4047-b4c4-82c87fb08cce"',
            '2026-11-12T00:59:39.125+07:00 INFO combat.turn.finished category="combat" message="Ход завершён" action=null actor="iora" actor_uuid="7680283b-19af-451b-84b8-5fe3dffa603c" combat="146595ac-fb68-45a8-b427-f7bd98af4368" equipment_changes="[]" movement_spent=false reason="истекло время или участник отключился" round=14 turn_id="bb4d8b49-c1ee-4047-b4c4-82c87fb08cce"',
            '2026-11-12T00:59:39.127+07:00 INFO combat.turn.started category="combat" message="Начат ход" actor="Kiras" actor_uuid="bda71d53-e4e9-47a4-a6c6-7cfd0c08acab" combat="146595ac-fb68-45a8-b427-f7bd98af4368" round=14 turn_id="fa4458cf-a7fa-4a7d-934d-4a1b6390e9fc"',
            '2026-11-12T01:00:39.385+07:00 INFO combat.turn.finished category="combat" message="Ход завершён" action=null actor="Kiras" actor_uuid="bda71d53-e4e9-47a4-a6c6-7cfd0c08acab" combat="146595ac-fb68-45a8-b427-f7bd98af4368" equipment_changes="[]" movement_spent=false reason="истекло время или участник отключился" round=14 turn_id="fa4458cf-a7fa-4a7d-934d-4a1b6390e9fc"',
            '2026-11-12T01:00:39.387+07:00 INFO combat.round.started category="combat" message="Начат раунд" combat="146595ac-fb68-45a8-b427-f7bd98af4368" reason="завершён круг ходов" round=15 turn_id="fa4458cf-a7fa-4a7d-934d-4a1b6390e9fc"',
            '2026-11-12T01:00:39.390+07:00 INFO combat.turn.started category="combat" message="Начат ход" actor="iora" actor_uuid="7680283b-19af-451b-84b8-5fe3dffa603c" combat="146595ac-fb68-45a8-b427-f7bd98af4368" round=15 turn_id="69a79fee-6a22-4832-aac0-f0a35798201a"',
            '2026-11-12T01:01:39.636+07:00 INFO combat.turn.finished category="combat" message="Ход завершён" action=null actor="iora" actor_uuid="7680283b-19af-451b-84b8-5fe3dffa603c" combat="146595ac-fb68-45a8-b427-f7bd98af4368" equipment_changes="[]" movement_spent=false reason="истекло время или участник отключился" round=15 turn_id="69a79fee-6a22-4832-aac0-f0a35798201a"',
            '2026-11-12T01:01:39.638+07:00 INFO combat.turn.started category="combat" message="Начат ход" actor="Kiras" actor_uuid="bda71d53-e4e9-47a4-a6c6-7cfd0c08acab" combat="146595ac-fb68-45a8-b427-f7bd98af4368" round=15 turn_id="68e701bc-894c-40a0-9615-0a676e452b8c"',
            '2026-11-12T01:02:39.856+07:00 INFO combat.turn.finished category="combat" message="Ход завершён" action=null actor="Kiras" actor_uuid="bda71d53-e4e9-47a4-a6c6-7cfd0c08acab" combat="146595ac-fb68-45a8-b427-f7bd98af4368" equipment_changes="[]" movement_spent=false reason="истекло время или участник отключился" round=15 turn_id="68e701bc-894c-40a0-9615-0a676e452b8c"',
            '2026-11-12T01:02:39.858+07:00 INFO combat.round.started category="combat" message="Начат раунд" combat="146595ac-fb68-45a8-b427-f7bd98af4368" reason="завершён круг ходов" round=16 turn_id="68e701bc-894c-40a0-9615-0a676e452b8c"',
            '2026-11-12T01:02:39.860+07:00 INFO combat.turn.started category="combat" message="Начат ход" actor="iora" actor_uuid="7680283b-19af-451b-84b8-5fe3dffa603c" combat="146595ac-fb68-45a8-b427-f7bd98af4368" round=16 turn_id="b5bea893-8ad2-4a4b-a4d4-d5df35cfa1b4"',
            '2026-11-12T01:03:40.054+07:00 INFO combat.turn.finished category="combat" message="Ход завершён" action=null actor="iora" actor_uuid="7680283b-19af-451b-84b8-5fe3dffa603c" combat="146595ac-fb68-45a8-b427-f7bd98af4368" equipment_changes="[]" movement_spent=false reason="истекло время или участник отключился" round=16 turn_id="b5bea893-8ad2-4a4b-a4d4-d5df35cfa1b4"',
            '2026-11-12T01:03:40.057+07:00 INFO combat.turn.started category="combat" message="Начат ход" actor="Kiras" actor_uuid="bda71d53-e4e9-47a4-a6c6-7cfd0c08acab" combat="146595ac-fb68-45a8-b427-f7bd98af4368" round=16 turn_id="071eec8d-eb54-42af-a30e-19ffe74e99b9"',
            '2026-11-12T01:04:40.257+07:00 INFO combat.turn.finished category="combat" message="Ход завершён" action=null actor="Kiras" actor_uuid="bda71d53-e4e9-47a4-a6c6-7cfd0c08acab" combat="146595ac-fb68-45a8-b427-f7bd98af4368" equipment_changes="[]" movement_spent=false reason="истекло время или участник отключился" round=16 turn_id="071eec8d-eb54-42af-a30e-19ffe74e99b9"',
            '2026-11-12T01:04:40.259+07:00 INFO combat.round.started category="combat" message="Начат раунд" combat="146595ac-fb68-45a8-b427-f7bd98af4368" reason="завершён круг ходов" round=17 turn_id="071eec8d-eb54-42af-a30e-19ffe74e99b9"',
            '2026-11-12T01:04:40.262+07:00 INFO combat.turn.started category="combat" message="Начат ход" actor="iora" actor_uuid="7680283b-19af-451b-84b8-5fe3dffa603c" combat="146595ac-fb68-45a8-b427-f7bd98af4368" round=17 turn_id="6162e39d-ac12-4b00-a7b5-b0135c66ea02"',
            '2026-11-12T01:05:40.471+07:00 INFO combat.turn.finished category="combat" message="Ход завершён" action=null actor="iora" actor_uuid="7680283b-19af-451b-84b8-5fe3dffa603c" combat="146595ac-fb68-45a8-b427-f7bd98af4368" equipment_changes="[]" movement_spent=false reason="истекло время или участник отключился" round=17 turn_id="6162e39d-ac12-4b00-a7b5-b0135c66ea02"',
            '2026-11-12T01:05:40.473+07:00 INFO combat.turn.started category="combat" message="Начат ход" actor="Kiras" actor_uuid="bda71d53-e4e9-47a4-a6c6-7cfd0c08acab" combat="146595ac-fb68-45a8-b427-f7bd98af4368" round=17 turn_id="754664a6-af5b-4d7e-868e-71f5b3c57ca9"',
            '2026-11-12T01:06:40.691+07:00 INFO combat.turn.finished category="combat" message="Ход завершён" action=null actor="Kiras" actor_uuid="bda71d53-e4e9-47a4-a6c6-7cfd0c08acab" combat="146595ac-fb68-45a8-b427-f7bd98af4368" equipment_changes="[]" movement_spent=false reason="истекло время или участник отключился" round=17 turn_id="754664a6-af5b-4d7e-868e-71f5b3c57ca9"',
            '2026-11-12T01:06:40.694+07:00 INFO combat.round.started category="combat" message="Начат раунд" combat="146595ac-fb68-45a8-b427-f7bd98af4368" reason="завершён круг ходов" round=18 turn_id="754664a6-af5b-4d7e-868e-71f5b3c57ca9"',
            '2026-11-12T01:06:40.698+07:00 INFO combat.turn.started category="combat" message="Начат ход" actor="iora" actor_uuid="7680283b-19af-451b-84b8-5fe3dffa603c" combat="146595ac-fb68-45a8-b427-f7bd98af4368" round=18 turn_id="6ba28f9f-1034-4b83-88e0-2a289feeecb4"',
            '2026-11-12T01:07:40.901+07:00 INFO combat.turn.finished category="combat" message="Ход завершён" action=null actor="iora" actor_uuid="7680283b-19af-451b-84b8-5fe3dffa603c" combat="146595ac-fb68-45a8-b427-f7bd98af4368" equipment_changes="[]" movement_spent=false reason="истекло время или участник отключился" round=18 turn_id="6ba28f9f-1034-4b83-88e0-2a289feeecb4"',
            '2026-11-12T01:07:40.903+07:00 INFO combat.turn.started category="combat" message="Начат ход" actor="Kiras" actor_uuid="bda71d53-e4e9-47a4-a6c6-7cfd0c08acab" combat="146595ac-fb68-45a8-b427-f7bd98af4368" round=18 turn_id="d2217dc4-405f-45df-b48d-ec77250daad9"',
            '2026-11-12T01:08:29.494+07:00 INFO combat.member.removed category="combat" message="Участник покинул бой" actor="Kiras" actor_uuid="bda71d53-e4e9-47a4-a6c6-7cfd0c08acab" combat="146595ac-fb68-45a8-b427-f7bd98af4368" reason="Kiras сбежал из боя" round=18 turn_id="d2217dc4-405f-45df-b48d-ec77250daad9"',
            '2026-11-12T01:08:29.662+07:00 INFO combat.completed category="combat" message="Бой завершён" action=null combat="146595ac-fb68-45a8-b427-f7bd98af4368" count=1 movement_spent=false reason="остался один участник" round=18 turn_id="d2217dc4-405f-45df-b48d-ec77250daad9"',
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
        name: '2026-11-09.001.log',
        modifiedAt: '2026-11-08T19:29:14.683Z',
        combatUuid: null,
        lines: [
            '2026-11-09T02:29:14.588+07:00 WARN states.validation category="states" message="Проверка данных игрока" count=1 details="[{\\"path\\":\\"tech.potion_effects[0].ticks_remaining\\",\\"reason\\":\\"отсутствует\\",\\"expected\\":\\"number\\",\\"actual\\":\\"missing\\",\\"value\\":\\"отсутствует\\",\\"action\\":\\"значение по умолчанию\\"}]" extra=0 invalid_type=0 missing=1 omitted=0 part=1 parts=1 player="iora" player_uuid="7680283b-19af-451b-84b8-5fe3dffa603c" validation_id="63d7c394-d4dc-4f96-bf98-6cda78273423"',
            '2026-11-09T02:29:14.683+07:00 WARN states.repair category="states" message="Восстановление данных игрока" player="iora" player_uuid="7680283b-19af-451b-84b8-5fe3dffa603c" remaining=0 repaired=1 result="исправлено" validation_id="63d7c394-d4dc-4f96-bf98-6cda78273423"',
        ],
    },
    {
        category: ELogCategory.States,
        name: '2026-11-09.002.log',
        modifiedAt: '2026-11-08T20:17:15.879Z',
        combatUuid: null,
        lines: [
            '2026-11-09T03:17:15.788+07:00 WARN states.validation category="states" message="Проверка данных игрока" count=4 details="[{\\"path\\":\\"tech.potion_effects[0].ticks_remaining\\",\\"reason\\":\\"отсутствует\\",\\"expected\\":\\"number\\",\\"actual\\":\\"missing\\",\\"value\\":\\"отсутствует\\",\\"action\\":\\"значение по умолчанию\\"},{\\"path\\":\\"tech.potion_effects[1].ticks_remaining\\",\\"reason\\":\\"отсутствует\\",\\"expected\\":\\"number\\",\\"actual\\":\\"missing\\",\\"value\\":\\"отсутствует\\",\\"action\\":\\"значение по умолчанию\\"},{\\"path\\":\\"tech.potion_effects[2].ticks_remaining\\",\\"reason\\":\\"отсутствует\\",\\"expected\\":\\"number\\",\\"actual\\":\\"missing\\",\\"value\\":\\"отсутствует\\",\\"action\\":\\"значение по умолчанию\\"},{\\"path\\":\\"tech.potion_effects[3].ticks_remaining\\",\\"reason\\":\\"отсутствует\\",\\"expected\\":\\"number\\",\\"actual\\":\\"missing\\",\\"value\\":\\"отсутствует\\",\\"action\\":\\"значение по умолчанию\\"}]" extra=0 invalid_type=0 missing=4 omitted=0 part=1 parts=1 player="iora" player_uuid="7680283b-19af-451b-84b8-5fe3dffa603c" validation_id="7dcaa864-ee42-4a8f-aff0-246f5b8a8bbe"',
            '2026-11-09T03:17:15.879+07:00 WARN states.repair category="states" message="Восстановление данных игрока" player="iora" player_uuid="7680283b-19af-451b-84b8-5fe3dffa603c" remaining=0 repaired=4 result="исправлено" validation_id="7dcaa864-ee42-4a8f-aff0-246f5b8a8bbe"',
        ],
    },
    {
        category: ELogCategory.States,
        name: '2026-11-10.001.log',
        modifiedAt: '2026-11-09T18:55:24.024Z',
        combatUuid: null,
        lines: [
            '2026-11-10T01:55:23.941+07:00 WARN states.validation category="states" message="Проверка данных игрока" count=4 details="[{\\"path\\":\\"tech.potion_effects[0].ticks_remaining\\",\\"reason\\":\\"отсутствует\\",\\"expected\\":\\"number\\",\\"actual\\":\\"missing\\",\\"value\\":\\"отсутствует\\",\\"action\\":\\"значение по умолчанию\\"},{\\"path\\":\\"tech.potion_effects[1].ticks_remaining\\",\\"reason\\":\\"отсутствует\\",\\"expected\\":\\"number\\",\\"actual\\":\\"missing\\",\\"value\\":\\"отсутствует\\",\\"action\\":\\"значение по умолчанию\\"},{\\"path\\":\\"tech.potion_effects[2].ticks_remaining\\",\\"reason\\":\\"отсутствует\\",\\"expected\\":\\"number\\",\\"actual\\":\\"missing\\",\\"value\\":\\"отсутствует\\",\\"action\\":\\"значение по умолчанию\\"},{\\"path\\":\\"tech.potion_effects[3].ticks_remaining\\",\\"reason\\":\\"отсутствует\\",\\"expected\\":\\"number\\",\\"actual\\":\\"missing\\",\\"value\\":\\"отсутствует\\",\\"action\\":\\"значение по умолчанию\\"}]" extra=0 invalid_type=0 missing=4 omitted=0 part=1 parts=1 player="iora" player_uuid="7680283b-19af-451b-84b8-5fe3dffa603c" validation_id="ae26205a-b633-4676-bc02-bb6785937451"',
            '2026-11-10T01:55:24.024+07:00 WARN states.repair category="states" message="Восстановление данных игрока" player="iora" player_uuid="7680283b-19af-451b-84b8-5fe3dffa603c" remaining=0 repaired=4 result="исправлено" validation_id="ae26205a-b633-4676-bc02-bb6785937451"',
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
        name: '2026-11-15.001.log',
        modifiedAt: '2026-11-15T00:00:41.484Z',
        combatUuid: null,
        lines: [
            '2026-11-15T07:00:41.484+07:00 WARN logging.cleanup category="system" message="Удалены старые журналы" bytes=3030 reason="срок хранения или квота" removed=1',
        ],
    },
    {
        category: ELogCategory.System,
        name: '2026-11-16.001.log',
        modifiedAt: '2026-11-16T00:00:38.820Z',
        combatUuid: null,
        lines: [
            '2026-11-16T07:00:38.820+07:00 WARN logging.cleanup category="system" message="Удалены старые журналы" bytes=1632 reason="срок хранения или квота" removed=1',
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

        if (query.action) {
            if (!entry.event?.startsWith('combat.')) {
                return false;
            }

            if (query.action === ELogCombatAction.None) {
                if (!('action' in entry.fields) || entry.fields.action !== null) {
                    return false;
                }
            } else if (
                typeof entry.fields.action !== 'string'
                || entry.fields.action.trim().toLowerCase() !== query.action
            ) {
                return false;
            }
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
