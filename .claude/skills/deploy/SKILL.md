---
name: deploy
description: >-
  Особенности деплоя и прод-запуска ЭТОГО САЙТА на боевом сервере (shared-хостинг
  с другими проектами, включая GravitLauncher на том же домене). Читай ПЕРЕД
  любой работой с docker-compose.yml, deploy.sh, .env, nginx-конфигом сайта,
  pm2, а также при диагностике "сайт не запускается/не поднялся после
  перезагрузки/БД не подключается/порт занят". Собрано по реальным граблям,
  на которые уже наступали при разворачивании проекта.
---

# Деплой и прод-запуск сайта — особенности этого сервера

Сервер общий: на нём одновременно живут этот сайт, GravitLauncher (Minecraft-лаунчер,
`/minecraft/launcher` + `/minecraft/server`), панель Pterodactyl и ещё несколько
чужих проектов в docker (`splitit_*`, `shadowbox` и т.п.). Почти каждая проблема
ниже — это столкновение с уже занятым портом/доменом/процессом соседа, а не баг
самого сайта.

## 1. Node.js — версия и PATH

Системный дефолт через `nvm` может быть **старее**, чем требует Prisma
(нужно 20.19+/22.12+/24.0+). Симптом: `bun install` падает на `prisma`
preinstall-хуке с прямым текстом о минимальной версии.

Фикс: поставить нужную версию и **явно** подставлять её в PATH для каждой
команды — `nvm alias default` один сам по себе не гарантированно подхватывается
в новых shell-сессиях/от других инструментов:

```bash
source ~/.nvm/nvm.sh && nvm install 22.23.1
export PATH="$HOME/.nvm/versions/node/v22.23.1/bin:$PATH"   # добавлять перед bun/npx-командами
```

## 2. PostgreSQL в docker-compose

- **Порт 5432 часто занят** другим Postgres-контейнером на сервере. Если
  `docker compose up -d db` падает с `port is already allocated` — проверять
  `docker ps` на предмет чужих контейнеров на 5432, не сразу трогать свой конфиг.
- Если контейнер уже был создан **в момент конфликта порта**, `docker compose up`
  может молча "запустить" его без реального проброса порта (в `docker ps` пусто
  в колонке `PORTS`, хотя статус `Up`). Лечится пересозданием:
  `docker compose up -d --force-recreate db`.
- **Порт БД должен слушать только `127.0.0.1`**, не `0.0.0.0` — сервер публичный.
  В `docker-compose.yml`:
  ```yaml
  ports:
    - "127.0.0.1:${POSTGRES_PORT:-5432}:5432"
  ```
  Без `127.0.0.1:` порт торчит наружу на все интерфейсы — легко упустить,
  `docker compose ps` в этом случае показывает `0.0.0.0:5432->5432/tcp`.
- **Сверять `.env` и `docker-compose.yml` построчно.** Реальный баг, который был:
  `POSTGRES_DB=site`, но `DATABASE_URL` в том же файле указывал на `/eoc` —
  Prisma подключалась бы не туда. Ошибка не бросается в глаза, пока не полезешь
  в саму БД.
- `bcryptjs`-хеши (60 симв., `$2b$10$...`) не влезают ровно в `CHAR(n)`, если
  `n` был подобран под другой алгоритм — Postgres `CHAR` молча добивает пробелами
  до длины колонки и ломает точное сравнение хеша. Под bcrypt — `VARCHAR`/`TEXT`,
  не `CHAR`.

## 3. Права доступа — регулярно слетают на сервере

Проект на этом сервере разворачивался так, что часть файлов оказалась
`root`-owned, часть — с 777, но **без exec-бита у конкретных бинарников**.
Симптомы и фиксы:

- `bun run build` / `bun run dev` падает: `Permission denied`, `exit code 126`.
  Причина — не у самого файла в `node_modules/.bin/`, а у **файла, на который
  он ссылается символьной ссылкой** (`.bin/nuxt` → `../@nuxt/cli/bin/nuxi.mjs`).
  Смотреть именно на таргет:
  ```bash
  ls -la node_modules/.bin/nuxt              # symlink, права почти всегда 777
  ls -la node_modules/@nuxt/cli/bin/nuxi.mjs # реальный файл — вот тут может не быть +x
  chmod +x node_modules/@nuxt/cli/bin/nuxi.mjs
  ```
  Та же история случалась с `eslint`.
- `git status` показывает **вообще все файлы репозитория** изменёнными, хотя
  правок не вносили — это не контент, а разница в правах (644 → 755/777),
  которую git отслеживает через `core.fileMode`. Проверка:
  ```bash
  git diff --stat README.md   # 0 insertions/deletions при "M" в git status = чисто права
  git config core.fileMode    # true — вот и объяснение
  ```
  Не паниковать и не откатывать содержимое — оно не менялось.

## 4. Git-репозиторий: `.git`-внутренности тоже могут быть root-owned

Реальный кейс: `.git/refs/heads/main` и `.git/logs/HEAD` принадлежали `root`
без прав на запись для рабочего пользователя (директории при этом были 777).
`git commit` падал: `unable to append to '.git/logs/HEAD': Permission denied`.

**⚠️ Как чинить правильно, а как — не надо:**

- Директории 777 без sticky-бита позволяют удалить/пересоздать файл внутри
  независимо от его владельца — это рабочий путь, НО:
- Удаление **reflog-файлов** (`.git/logs/HEAD`, `.git/logs/refs/heads/<branch>`)
  безопасно — это просто локальная история перемещений ref, не влияет на коммиты.
- Удаление **самого ref-файла** (`.git/refs/heads/<branch>`) — **рискованно**:
  следующий `git commit` в этой ситуации может создать **orphan root-commit**
  (коммит без родителя, со всем деревом файлов, будто это первый коммит в
  истории) — именно так один раз и произошло.
- Если это уже случилось — не паниковать, старая история почти наверняка цела
  в object-базе (объекты не удаляются, теряется только указатель):
  ```bash
  git log --oneline --all -5        # новый root-commit наверху
  git cat-file -t <старый-хэш>      # commit — значит, объект жив
  git reset --soft <старый-хэш>     # переносит ветку обратно на правильного родителя,
                                     # текущие изменения остаются staged
  git status --short                # должны остаться только реально изменённые файлы
  git commit -m "..."               # закоммитить заново, уже на правильном родителе
  ```
- На будущее: если увидели `Permission denied` именно на `.git/refs/heads/*` —
  сначала попробовать почистить только `.git/logs/**`, и только если это не
  помогло — аккуратно разбираться с самим ref-файлом, а не удалять его сразу.

## 5. Dev-режим vs прод

`nuxt dev` (Vite dev-сервер) не предназначен для публичного трафика: source maps,
подробные стектрейсы, HMR/WS оверхед. Если всё же нужно временно погонять dev
за реальным доменом через nginx — упрётесь в защиту Vite от DNS rebinding:

```
Blocked request. This host ("eoc-rp.ru") is not allowed.
```

Временный фикс (только для dev, в проде не нужен и не участвует):
```ts
// nuxt.config.ts
export default defineNuxtConfig({
    vite: {
        server: {
            allowedHosts: ['eoc-rp.ru', 'www.eoc-rp.ru'],
        },
    },
});
```

**Для прода правильный путь — не dev-сервер, а сборка:**
```bash
bun run build                       # → .output/server/index.mjs (самодостаточный Nitro-сервер)
PORT=3001 node .output/server/index.mjs   # или через pm2, см. ниже
```
В собранном виде Vite не участвует вообще — `allowedHosts` неактуален.

## 6. Порт приложения

Дефолтный порт Nitro (3000) **занят другим проектом** на сервере
(`splitit_frontend`, отдельный docker-контейнер). Сайт запускается на **3001**
— всегда явно передавать `PORT`:
```bash
PORT=3001 pm2 start .output/server/index.mjs --name site
```
Перед тем, как поднимать новый процесс — проверить `ss -tlnp | grep <порт>`,
не полагаться на "порт по умолчанию свободен".

## 7. pm2 — процесс не переживает перезагрузку сервера

`pm2 save` сохраняет список процессов в дамп, но **сам демон pm2 не поднимается
при загрузке ОС**, если не настроен `pm2 startup` — после `reboot` `pm2 list`
будет пустым, даже если раньше всё было запущено и сохранено.

Разовая настройка (нужен sudo — команду печатает сам pm2, узнать заранее):
```bash
pm2 startup
# выполнить sudo-команду, которую он покажет, она специфична под текущего юзера/пути nvm
```

Быстро поднять сайт прямо сейчас, не дожидаясь перезагрузки:
```bash
pm2 resurrect
```

**`deploy.sh` должен явно задавать `PORT`** перед `pm2 start`/`pm2 reload`,
иначе автодеплой через CI однажды соберёт новую версию и попытается стартовать
на дефолтном 3000 (конфликт с соседним проектом):
```bash
PORT="${PORT:-3001}"
export PORT
```

## 8. nginx: домен шарится с GravitLauncher — конфликт на `/api`

GravitLauncher (Minecraft-лаунчер, отдельный проект на этом же сервере)
объявляет свой WebSocket-эндпоинт как `ws://eoc-rp.ru/api` — **буквально `/api`,
без подпути**, один-единственный сокет на весь протокол лаунчера (авторизация,
обновления и т.д. — всё мультиплексируется в одном соединении).

У сайта же **все** свои ручки лежат под `/api/<что-то>` (`/api/auth/login`,
`/api/character`, `/api/me`...) — ни одной ровно на `/api`.

**До нашего `site.conf` домен `eoc-rp.ru` (голый, без поддомена) не имел
явного `server_name` ни в одном nginx-конфиге** — запросы на него случайно
проваливались в первый по алфавиту `server{}`-блок (`launcher.conf`), у
которого как раз есть `location /api`. Как только у сайта появился
собственный явный `server_name eoc-rp.ru`, это случайное поведение исчезло —
`/api` стал уходить на сайт (404, ручки лаунчера отвалились), из-за чего
переставал коннектиться игровой сервер.

**Решение — точное совпадение пути**, а не префиксное, чтобы не перехватить
собственные ручки сайта (`location /api` перехватил бы и `/api/auth/login`
тоже — `location = /api` берёт только буквальный путь):

```nginx
server {
    listen 80;
    server_name eoc-rp.ru www.eoc-rp.ru;

    location = /api {
        if ($http_upgrade != "websocket") {
            return 403;                       # обычный GET/браузер — не пускаем
        }
        proxy_pass http://127.0.0.1:9274;     # порт LaunchServer, см. /minecraft/launcher
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;  # map уже объявлена в launcher.conf
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
    location /webapi/ {                        # отдельный REST-неймспейс лаунчера, не пересекается
        proxy_pass http://127.0.0.1:9274/webapi/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location / {
        return 301 https://$host$request_uri;   # редирект на https — только для сайта!
    }
}

server {
    listen 443 ssl http2;
    server_name eoc-rp.ru www.eoc-rp.ru;
    # ssl_* — см. текущий /etc/nginx/sites-available/site.conf
    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

Ключевые моменты, если снова будете трогать `site.conf`:

- **Редирект на https не должен ловить `/api`** — LaunchServer использует
  `ws://` (не `wss://`), WebSocket-клиент не умеет ходить за 301-редиректом.
  Поэтому `location = /api` и `location /webapi/` объявлены раньше общего
  `location /` с редиректом (в nginx более специфичная `location` матчится
  первой независимо от порядка объявления, но здесь порядок и так логичный).
- **Блок `listen 443` (сайт) `/api` вообще не трогает** — туда ходит браузер,
  и там просто нет правила `/api`, всё уходит в `location /` на сайт. Так что
  открыть `https://eoc-rp.ru/api` в браузере — это 404 от сайта, безопасно,
  никак не пересекается с лаунчером.
- **Изменения в этих конфигах nginx требуют sudo** — Claude не может их
  применить сам (`/etc/nginx/sites-available/*` принадлежит root). Всегда:
  ```bash
  sudo nginx -t && sudo systemctl reload nginx
  ```
- **Общий урок**: если на сервере несколько vhost-файлов с разными
  поддоменами и НИ ОДИН явно не заявляет голый домен через `server_name` —
  nginx неявно отдаёт этот домен первому по алфавиту конфигу. Заводя новый
  vhost под уже "как-то работавший" голый домен — проверять, что раньше туда
  ходило, а не только что должно ходить теперь.

## 9. Чеклист: с нуля / после простоя

```bash
# 1. БД
cd /var/www/site && docker compose up -d db
docker compose ps                                   # порт 127.0.0.1:5432, статус Up

# 2. Зависимости и версия node
export PATH="$HOME/.nvm/versions/node/v22.23.1/bin:$PATH"
bun install
chmod +x node_modules/@nuxt/cli/bin/nuxi.mjs 2>/dev/null || true   # на случай слетевших прав

# 3. Миграции + сборка
bun run db:deploy
bun run build

# 4. Запуск/перезапуск через pm2
PORT=3001 pm2 start .output/server/index.mjs --name site   # первый раз
# или
pm2 reload site --update-env                                # если процесс уже есть
pm2 save

# 5. Проверка
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3001/
curl -sI https://eoc-rp.ru/ | head -1

# 6. После ЛЮБОЙ перезагрузки сервера — если сайт не встал сам:
pm2 resurrect
# и убедиться, что настроен автозапуск (см. раздел 7), чтобы больше не требовалось руками
```
