# Backend — API аутентификации

Node.js + Express + JWT + bcrypt. Хранилище на старте — `lowdb` (файл
`data/db.json`), см. `docs/ARCHITECTURE.md` в корне репозитория для деталей.

## Запуск

```bash
cp .env.example .env
npm install
npm run dev      # nodemon, автоперезапуск
# либо
npm start
```

Сервер поднимется на `http://localhost:4000` (или на порту из `.env`).

## Переменные окружения

| Переменная       | Назначение                          | По умолчанию |
|------------------|--------------------------------------|--------------|
| `PORT`           | порт сервера                         | `4000`       |
| `JWT_SECRET`      | секрет для подписи токенов           | dev-значение, **обязательно смените в проде** |
| `JWT_EXPIRES_IN`  | срок жизни токена                    | `7d`         |
| `GOOGLE_CLIENT_ID`| Client ID из Google Cloud Console для входа через Google | не задан — вход через Google выключен |

Как получить `GOOGLE_CLIENT_ID` и что прописать на фронтенде — см.
раздел «Google OAuth» в [`../docs/API.md`](../docs/API.md).

## Эндпоинты

См. [`../docs/API.md`](../docs/API.md).
