# Index — образовательная платформа по экономике

Index учит понимать экономику через короткие интерактивные уроки и практику на
живых данных, а не через сухую теорию из учебника.

Сейчас в репозитории реализован **фундамент проекта**: экран входа и
регистрации с фирменным дизайном, и рабочий backend-сервис аутентификации.
Уроки, курсы и интерактивные задания — следующий этап.

## Структура репозитория

```
econplatform/
├── frontend/               # клиентская часть (статические HTML/CSS/JS)
│   └── public/
│       ├── index.html      # экран входа / регистрации
│       ├── dashboard.html  # заглушка личного кабинета
│       └── assets/
│           ├── css/        # main.css (фон, layout), auth.css (форма)
│           └── js/         # auth.js (табы, валидация, запросы к API)
├── backend/                 # Node.js + Express API аутентификации
│   ├── src/
│   │   ├── config/          # подключение к БД
│   │   ├── controllers/     # логика register / login / me
│   │   ├── middleware/      # JWT-guard, обработка ошибок
│   │   ├── models/          # модель User
│   │   ├── routes/          # маршруты /api/auth/*
│   │   ├── utils/           # валидаторы
│   │   ├── app.js
│   │   └── server.js
│   └── data/db.json          # локальное файловое хранилище (для разработки)
├── docs/                     # архитектура, API, гайд по дизайну
├── scripts/                  # вспомогательные скрипты запуска
└── .github/workflows/        # CI (линт/тесты при пуше)
```

## Быстрый старт

### 1. Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev        # http://localhost:4000
```

### 2. Frontend

Frontend — статические файлы, сборка не нужна. Откройте
`frontend/public/index.html` в браузере или поднимите локальный сервер:

```bash
cd frontend/public
npx serve .         # либо любой статик-сервер
```

Форма входа/регистрации по умолчанию стучится в `http://localhost:4000/api`.
Чтобы поменять адрес API, задайте `window.__API_BASE__` перед подключением
`auth.js` (см. `docs/API.md`).

## Документация

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — как устроены frontend и backend
- [`docs/API.md`](docs/API.md) — эндпоинты аутентификации
- [`docs/DESIGN.md`](docs/DESIGN.md) — дизайн-система экрана входа
- [`docs/ROADMAP.md`](docs/ROADMAP.md) — что дальше
- [`CONTRIBUTING.md`](CONTRIBUTING.md) — как вносить изменения

## Стек

- **Frontend:** HTML / CSS / vanilla JS (без сборки, легко перевести на React позже)
- **Backend:** Node.js, Express, JWT, bcrypt, lowdb (файловое хранилище на старте)
- **CI:** GitHub Actions — установка зависимостей и проверка на каждый push

## Лицензия

MIT — см. [`LICENSE`](LICENSE).
