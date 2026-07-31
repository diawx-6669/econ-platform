#!/usr/bin/env bash
# Быстрая установка и первый запуск backend.
set -e

cd "$(dirname "$0")/../backend"

if [ ! -f .env ]; then
  cp .env.example .env
  echo "Создан backend/.env из .env.example — при необходимости отредактируйте JWT_SECRET."
fi

npm install

echo ""
echo "Готово. Запустить сервер:"
echo "  cd backend && npm run dev"
echo ""
echo "Frontend не требует сборки — откройте frontend/public/index.html в браузере."
