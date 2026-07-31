# API аутентификации

Базовый адрес по умолчанию: `http://localhost:4000/api`

Все запросы и ответы — JSON. Ошибки возвращаются в виде
`{ "message": "...", "errors": { "field": "..." } }`.

## `GET /health`

Проверка, что сервис жив.

**Ответ 200**
```json
{ "status": "ok", "service": "index-econ-backend" }
```

## `POST /auth/register`

**Тело запроса**
```json
{ "name": "Аружан", "email": "aruzhan@example.com", "password": "минимум8" }
```

**Ответ 201**
```json
{
  "user": { "id": "...", "name": "Аружан", "email": "aruzhan@example.com", "createdAt": "..." },
  "token": "eyJhbGciOi..."
}
```

**Возможные ошибки:** `422` — неверные данные, `409` — email уже занят.

## `POST /auth/login`

**Тело запроса**
```json
{ "email": "aruzhan@example.com", "password": "минимум8" }
```

**Ответ 200** — такой же формат, как у `register`.

**Возможные ошибки:** `401` — неверный email или пароль.

## `GET /auth/me`

Требует заголовок `Authorization: Bearer <token>`.

**Ответ 200**
```json
{ "user": { "id": "...", "name": "...", "email": "...", "createdAt": "..." } }
```

**Возможные ошибки:** `401` — токен отсутствует или недействителен.

## Изменение адреса API на фронтенде

По умолчанию `frontend/public/assets/js/auth.js` обращается к
`http://localhost:4000/api`. Чтобы указать другой адрес (например, для
продакшена), задайте глобальную переменную до подключения скрипта:

```html
<script>window.__API_BASE__ = "https://api.your-domain.com/api";</script>
<script src="assets/js/auth.js"></script>
```
