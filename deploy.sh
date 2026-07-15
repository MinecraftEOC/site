#!/usr/bin/env bash
# Скрипт редеплоя проекта на сервере.
# Запускается из GitHub Actions по SSH (см. .github/workflows/deploy.yml),
# но его можно вызвать и вручную: bash deploy.sh
#
# Требования на сервере: git, bun, pm2, docker (для БД).

set -euo pipefail

# --- PATH для неинтерактивного SSH ---
# GitHub Actions заходит по SSH неинтерактивно, поэтому ~/.bashrc не читается,
# а bun/node ставят себя в PATH именно там. Прописываем нужные пути вручную.
export BUN_INSTALL="${BUN_INSTALL:-$HOME/.bun}"
export PATH="$BUN_INSTALL/bin:$PATH"

# Если node/pm2 установлены через nvm — подгружаем nvm.
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
if [ -s "$NVM_DIR/nvm.sh" ]; then
    . "$NVM_DIR/nvm.sh"
fi

# Директория проекта на сервере (при клонировании: /var/www/site).
APP_DIR="${APP_DIR:-/var/www/site}"
# Имя процесса в pm2.
PM2_NAME="${PM2_NAME:-site}"
# Порт, на котором Nitro поднимает сервер (3000 занят другим проектом на сервере).
PORT="${PORT:-3001}"
export PORT

cd "$APP_DIR"

# Подгружаем .env в окружение шелла, чтобы pm2 передал переменные
# (DATABASE_URL и т.д.) в спавнимый процесс. Собранный Nitro-бандл
# (.output/server/index.mjs) сам .env не читает — только явный process.env.
if [ -f "$APP_DIR/.env" ]; then
    set -a
    . "$APP_DIR/.env"
    set +a
else
    echo "==> ВНИМАНИЕ: $APP_DIR/.env не найден, приложение стартует без переменных окружения" >&2
fi

echo "==> Обновляем код из main"
git fetch --all
git reset --hard origin/main

echo "==> Устанавливаем зависимости (frozen lockfile)"
bun install --frozen-lockfile

echo "==> Применяем миграции БД"
bun run db:deploy

echo "==> Собираем проект"
bun run build

echo "==> Перезапускаем приложение (pm2)"
# reload — если процесс уже есть; иначе стартуем впервые.
if pm2 describe "$PM2_NAME" > /dev/null 2>&1; then
    pm2 reload "$PM2_NAME" --update-env
else
    pm2 start .output/server/index.mjs --name "$PM2_NAME"
    pm2 save
fi

echo "==> Готово"
