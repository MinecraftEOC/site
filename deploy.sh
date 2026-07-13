#!/usr/bin/env bash
# Скрипт редеплоя проекта на сервере.
# Запускается из GitHub Actions по SSH (см. .github/workflows/deploy.yml),
# но его можно вызвать и вручную: bash deploy.sh
#
# Требования на сервере: git, bun, pm2, docker (для БД).

set -euo pipefail

# Директория проекта на сервере (при клонировании: /var/www/site).
APP_DIR="${APP_DIR:-/var/www/site}"
# Имя процесса в pm2.
PM2_NAME="${PM2_NAME:-site}"
# Порт, на котором Nitro поднимает сервер (3000 занят другим проектом на сервере).
PORT="${PORT:-3001}"
export PORT

cd "$APP_DIR"

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
