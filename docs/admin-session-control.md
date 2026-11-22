# ТЗ: Управление игровой сессией с сайта через Pterodactyl Client API

Документ описывает интеграцию панели администратора сайта (`site`) с игровым сервером Minecraft через **Pterodactyl Client API** для запуска и остановки игровых сессий с автоматическим переключением вайтлиста и рестартом сервера.

---

## 1. Общая схема и сценарии работы

### Роль и доступ
- Доступ к разделу и серверным ручкам имеют только пользователи с ролью `UserRole.ADMIN` (`app/middleware/admin.ts` на клиенте и `requireAdmin(event)` в Nitro).
- Все запросы к Pterodactyl выполняются **только с бэкенда сайта** (`site/server/`), Client API key хранится в приватном `runtimeConfig` и никогда не отдаётся в браузер.

### Состояние между сессиями
- Между сессиями сервер Minecraft остаётся включённым, но:
  - `session.active === false` (в `/world/mappet/eoc/global.json`);
  - вайтлист включён (`white-list=true`), чтобы на сервер могли заходить только администраторы.

---

## 2. Настройка со стороны Pterodactyl (пошагово)

### Шаг 1. Найти URL панели и ID сервера
1. Откройте панель Pterodactyl в браузере и перейдите в консоль нужного Minecraft-сервера.
2. **URL панели** (`NUXT_PTERODACTYL_BASE_URL`): адрес из адресной строки до `/server/...` без завершающего слэша, например `https://panel.example.com`.
3. **ID сервера** (`NUXT_PTERODACTYL_SERVER_ID`): короткий 8-символьный идентификатор в конце URL консоли.
   - Пример: если URL имеет вид `https://panel.example.com/server/1a2b3c4d`, то ID сервера — `1a2b3c4d`.

### Шаг 2. Создать Client API Key (не Application API Key!)
> **Важно:** нужен именно **Client API Key** (начинается с `ptlc_`), а не ключ администратора Application API (`ptla_`).

1. Нажмите на свой профиль / иконку аккаунта в правом верхнем углу панели Pterodactyl.
2. Перейдите в **API Credentials** (прямой путь `/account/api`).
3. Нажмите **Create API Key** (или заполните форму создания ключа):
   - **Description:** понятное название, например `eoc-site-session-control`.
   - **Allowed IPs (опционально, рекомендуется):** укажите IP-адрес сервера, на котором запущен Nuxt-сайт (или оставьте пустым, если сайт и панель за разными NAT/IP меняются, но лучше зафиксировать IP хоста сайта).
4. Нажмите **Create**.
5. **Сразу скопируйте сгенерированный ключ (`ptlc_...`)** — панель показывает его только один раз.

### Шаг 3. Проверить права аккаунта на сервер в Pterodactyl
Аккаунт пользователя Pterodactyl, от имени которого создан `ptlc_`-ключ, должен иметь на сервере следующие права (в разделе **Users → Permissions** этого сервера, либо быть его владельцем/администратором):
- **Control (`control.console`)** — отправка команд в консоль (`POST .../command`);
- **Control (`control.restart` / `control.start` / `control.stop`)** — перезапуск сервера (`POST .../power`);
- **Control (`control.read-console`)** и чтение ресурсов — проверка статуса контейнера (`GET .../resources`);
- **File (`file.read-content`)** — чтение `global.json` и `server.properties` (`GET .../files/contents`).

### Шаг 4. Проверить поведение вайтлиста на сервере
1. В `server.properties` на Minecraft 1.12.2 команды консоли `whitelist on` и `whitelist off` автоматически обновляют параметр `white-list=true/false` и сохраняют файл на диск.
2. Убедитесь в панели, что в списке вайтлиста (`whitelist.json`) добавлены ники нужных администраторов и строителей (через `whitelist add <ник>`), чтобы при включённом вайтлисте они могли входить на сервер.

### Шаг 5. Быстрая проверка ключа через `curl` с сервера сайта
```bash
# 1. Проверка статуса сервера
curl -sS "https://<PANEL_URL>/api/client/servers/<SERVER_ID>/resources" \
  -H "Authorization: Bearer <PTLC_TOKEN>" \
  -H "Accept: application/json"

# 2. Проверка чтения global.json
curl -sS "https://<PANEL_URL>/api/client/servers/<SERVER_ID>/files/contents?file=%2Fworld%2Fmappet%2Feoc%2Fglobal.json" \
  -H "Authorization: Bearer <PTLC_TOKEN>" \
  -H "Accept: application/json"

# 3. Проверка отправки команды (безопасная команда, например whitelist list)
curl -i -X POST "https://<PANEL_URL>/api/client/servers/<SERVER_ID>/command" \
  -H "Authorization: Bearer <PTLC_TOKEN>" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"command":"whitelist list"}'
# Ожидается HTTP 204 No Content
```

---

## 3. Конфигурация сайта (`site`)

### Переменные окружения (`.env` сайта и `nuxt.config.ts`)
Добавить в `runtimeConfig` (`nuxt.config.ts`):
```ts
pterodactylBaseUrl: '',
pterodactylApiToken: '',
pterodactylServerId: '',
pterodactylTimeoutMs: 10000,
```
Соответствующие переменные в `.env` (подхватываются Nitro автоматически по префиксу `NUXT_`):
```dotenv
NUXT_PTERODACTYL_BASE_URL=https://panel.example.com
NUXT_PTERODACTYL_API_TOKEN=ptlc_...
NUXT_PTERODACTYL_SERVER_ID=1a2b3c4d
NUXT_PTERODACTYL_TIMEOUT_MS=10000
```

---

## 4. Серверная логика (Nitro API)

### 4.1. Утилита `server/utils/pterodactyl.ts`
Реализовать обёртки для Pterodactyl Client API (без утечки токена в ошибках и с `redirect: 'error'`):
1. `getServerResources()` → `GET /api/client/servers/{id}/resources` — возвращает `currentState` (`offline | starting | running | stopping`), `uptime` и т.д.
2. `readServerFile(path: string)` → `GET /api/client/servers/{id}/files/contents?file=${encodeURIComponent(path)}` — читает текстовый файл (учитывать, что Pterodactyl отдаёт raw text/JSON; при парсинге `global.json` проверять валидность JSON).
3. `sendConsoleCommand(command: string)` → `POST /api/client/servers/{id}/command` с `{ command }` (ожидается `204`).
4. `sendPowerSignal(signal: 'start' | 'stop' | 'restart')` → `POST /api/client/servers/{id}/power` с `{ signal }` (ожидается `204`).

Для чтения состояния сессии и вайтлиста:
- `readGlobalSession()`: читает `/world/mappet/eoc/global.json`, возвращает `{ index, active, duration, start_hour, ticks }`.
- `readWhitelistEnabled()`: читает `/server.properties`, находит строку `white-list=(true|false)`.

---

### 4.2. Менеджер фоновой операции в памяти Nitro (`server/utils/session-control.ts`)

Перезапуск Minecraft (Forge 1.12.2 + Mappet) занимает ~30–90 секунд, поэтому HTTP-запрос от кнопки **не должен** висеть в ожидании конца рестарта.

#### Состояние задачи (singleton в процессе Nitro)
Хранить объект текущей операции (по аналогии с `active_job_id` в `data-exchanger`):
```ts
type TSessionOperationKind = 'start' | 'stop';
type TSessionOperationStatus = 'idle' | 'running' | 'success' | 'error';

interface ISessionJobState {
    id: string | null;
    kind: TSessionOperationKind | null;
    status: TSessionOperationStatus;
    step: string;           // человекочитаемый этап для UI
    startedAt: string | null;
    finishedAt: string | null;
    error: string | null;
}
```
Пока `status === 'running'`, повторные вызовы запуска/остановки возвращают `409 Conflict` («Уже выполняется операция над сессией»).

---

### 4.3. Алгоритм «Запустить сессию»

Входные параметры (валидация Zod):
- `startHour`: целое число `1..24` (по умолчанию `6`);
- `duration`: целое число `1..24` (по умолчанию `7`).

Предварительные проверки до старта задачи:
1. Прочитать `global.json` — убедиться, что `session.active === false` (если уже `true`, вернуть `409`).
2. Проверить через `getServerResources()`, что сервер сейчас в состоянии `running` (если сервер выключен — возвращать `409` с понятным сообщением либо сначала требовать включить сервер).
3. Зафиксировать `previousIndex = session.index`.

Пошаговое выполнение в фоне:
1. **Этап `restarting` («Перезапуск сервера»):**
   - Отправить `sendPowerSignal('restart')`.
2. **Этап `waiting_offline` («Ожидание остановки старого процесса»):**
   - Опрашивать `pingMinecraftServer(minecraftHost, minecraftPort)` (и/или `getServerResources()`), пока пинг не упадёт **или** `currentState !== 'running'` (интервал опроса 2с, таймаут до 60с).
   - Это гарантирует, что мы не приняли старый ещё не завершившийся процесс за перезапущенный.
3. **Этап `waiting_online` («Ожидание загрузки мира»):**
   - Опрашивать каждые 3с (общий таймаут ожидания загрузки, например, 180с):
     - сначала проверять `currentState === 'running'` через `getServerResources()`;
     - затем вызывать `pingMinecraftServer(minecraftHost, minecraftPort)` из `server/utils/minecraft.ts`.
   - **Важный нюанс Forge 1.12.2:** сетевой сокет (`25565`) может начать отвечать на пинг чуть раньше полной инициализации мира и Mappet-скриптов. Поэтому после первого успешного `pingMinecraftServer()` выждать стабилизационную паузу (например, 5с) перед отправкой команды.
4. **Этап `starting_session` («Запуск скрипта новой сессии»):**
   - Сформировать консольную команду Mappet 0.9:
     ```text
     mp script exec ~ handlers/session/handleSessionStart.js main {start_hour:<startHour>,duration:<duration>}
     ```
     *(Цель `~` обязательна — позволяет выполнять команду от имени сервера при нулевом онлайне; путь к скрипту без ведущего `/`.)*
   - Отправить `sendConsoleCommand(...)`.
   - Проверить результат, перечитывая `global.json` (до 4 попыток с паузой 3с, т.к. `mp script exec` асинхронен для HTTP API и ответ от `/command` — пустой `204`):
     - успех, когда `session.index > previousIndex` и `session.active === true`.
     - если после первой команды `global.json` не изменился (например, команда попала в окно до полной готовности Mappet), повторить `mp script exec` ещё раз с паузой 3с (благо `handleSessionStart` идемпотентен по шагам).
     - если и после повторов `active !== true`, завершить задачу со статусом `error` (вайтлист при этом **не выключать**, чтобы игроки не зашли до старта сессии!).
5. **Этап `disabling_whitelist` («Выключение вайтлиста»):**
   - Отправить `sendConsoleCommand('whitelist off')`.
   - Подождать 1с, перечитать `server.properties` (убедиться, что `white-list=false`) и завершить задачу со статусом `success`.

> **Почему `whitelist off` делается последним шагом, а не до рестарта:** игроки гарантированно не зайдут на сервер до рестарта и до завершения расчётов `handleSessionStart` (налоги, заказы, итоги выборов совета). Пока `whitelist` был включён, админы могли работать на сервере, а по завершении старта сервер сразу открывается для всех.

---

### 4.4. Алгоритм «Остановить сессию»

Предварительные проверки:
1. Прочитать `global.json` — убедиться, что `session.active === true` (если уже `false`, вернуть `409`).
2. Проверить через `getServerResources()`, что сервер сейчас `running`.

Пошаговое выполнение в фоне:
1. **Этап `stopping_session` («Остановка сессии на сервере»):**
   - Отправить `sendConsoleCommand('mp script exec ~ handlers/session/handleSessionStop.js')`.
   - Через 1–2с проверить по `global.json`, что `session.active === false` (до 3 проверок с интервалом 2с). Если `session.active` не сбросился — вернуть `error` и не рестартить сервер.
2. **Этап `enabling_whitelist` («Включение вайтлиста»):**
   - Отправить `sendConsoleCommand('whitelist on')`.
   - Подождать 1с и перечитать `server.properties`, убедиться что `white-list=true`.
3. **Этап `restarting` («Перезапуск сервера»):**
   - Отправить `sendPowerSignal('restart')`.
   - Ожидать ухода в оффлайн и последующего успешного `pingMinecraftServer()` (по той же логике `waiting_offline` → `waiting_online`), чтобы на UI кнопка вернулась в актуальное готовое состояние (и при рестарте все обычные игроки были отключены с `handlePlayerLogout`, а зайти снова смогли только админы из вайтлиста).
   - Статус задачи → `success`.

---

### 4.5. Список Nitro-эндпоинтов сайта

Все ручки находятся в `site/server/api/admin/session/`, вызывают `requireAdmin(event)` и выставляют `Cache-Control: private, no-store`:

1. **`GET /api/admin/session`** (`index.get.ts`)
   - Возвращает текущее состояние для UI:
     - `session`: `{ index, active, duration, start_hour, ticks, formattedTime, remainingTime }` (по формулам из `TimeUtils` / `global.json`);
     - `whitelistEnabled`: `boolean | null` (из `server.properties`);
     - `server`: `{ state, online, players, maxPlayers }` (из `getServerResources()` + `pingMinecraftServer()` без долгого кэша `STATUS_CACHE_TTL`);
     - `job`: текущее состояние фоновой операции (`ISessionJobState`).
2. **`POST /api/admin/session/start`** (`start.post.ts`)
   - Валидирует `{ startHour, duration }` (по умолчанию `6` и `7`, оба целые `1..24`).
   - Проводит pre-flight проверки (`!session.active`, `server === running`, `job.status !== 'running'`).
   - Запускает фоновый процесс, возвращает `{ job }` со статусом `202 Accepted`.
3. **`POST /api/admin/session/stop`** (`stop.post.ts`)
   - Проводит pre-flight проверки (`session.active`, `server === running`, `job.status !== 'running'`).
   - Запускает фоновый процесс, возвращает `{ job }` со статусом `202 Accepted`.

---

## 5. Пользовательский интерфейс (`site/app/`)

1. **Роут и навигация:**
   - Добавить `adminSession: '/account/admin/session'` в `app/assets/ts/constants/routes.ts`.
   - Добавить пункт «Управление сессией» в `ADMIN_MENU` в `app/components/layouts/TheAccountSidebar.vue`.
   - Страница `app/pages/account/admin/session/index.vue` с `definePageMeta({ layout: 'account', middleware: 'admin' })`.
2. **Содержимое страницы:**
   - Карточка текущего состояния:
     - номер сессии (`#47`), игровая дата/время, статус (`Активна` / `Завершена`), прогресс тиков (`ticks / 18000`);
     - статус сервера (`running` / `offline`, онлайн игроков) и состояние вайтлиста (`Включён` / `Выключен`).
   - Блок запуска сессии (активен, когда `session.active === false` и нет запущенной операции):
     - поля `Час начала (1–24)` (по умолчанию `6`) и `Длительность в часах (1–24)` (по умолчанию `7`);
     - кнопка **«Запустить сессию»** с модальным подтверждением (предупреждение: сервер будет перезапущен, после загрузки запустится расчёт сессии и откроется доступ игрокам).
   - Блок остановки сессии (активен, когда `session.active === true` и нет запущенной операции):
     - кнопка **«Остановить сессию»** с модальным подтверждением (предупреждение: сессия будет завершена, включится вайтлист и сервер перезапустится).
   - Индикатор выполняемой операции: при `job.status === 'running'` опрашивает `GET /api/admin/session` каждые 2–3с, показывает текущий этап (`step`) и блокирует обе кнопки; при ошибке выводит текст ошибки `job.error`.

---

## 6. Критерии приёмки

1. При нажатии **«Запустить сессию»** (когда `active === false`, вайтлист включён):
   - сервер перезапускается;
   - после подъёма порта и проверки `pingMinecraftServer()` в `global.json` инкрементируется `session.index`, выставляется `session.active = true`, `ticks = 0`, задаются выбранные `start_hour` и `duration`;
   - вайтлист выключается (`white-list=false` в `server.properties`), обычные игроки могут зайти.
2. При нажатии **«Остановить сессию»** (когда `active === true`):
   - `session.active` становится `false` (при этом `session.index` не меняется);
   - вайтлист включается (`white-list=true` в `server.properties`);
   - сервер перезапускается (все игроки без вайтлиста отключаются), после рестарта зайти могут только участники вайтлиста.
3. Повторное нажатие кнопок во время рестарта блокируется (`409` на бэкенде и disabled-состояние на фронте).
4. Обычный пользователь (не `ADMIN`) получает `403` на все `/api/admin/session*` и редирект со страницы админки.
