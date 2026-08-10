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

## `POST /auth/google`

Вход/регистрация через Google (Sign in with Google). Фронтенд получает
`credential` (JWT-токен) от Google Identity Services и пересылает его сюда.
Бэкенд сам проверяет подпись токена в Google и создаёт аккаунт, если его ещё
не было — отдельного шага регистрации через Google не требуется.

**Тело запроса**
```json
{ "credential": "eyJhbGciOi..." }
```

**Ответ 200** — такой же формат, как у `register`/`login`.

**Возможные ошибки:** `401` — токен не прошёл проверку Google, `422` — токен
не передан, `500` — на сервере не задан `GOOGLE_CLIENT_ID`.

**Настройка:**
1. В [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   создайте OAuth client ID типа Web application.
2. В Authorized JavaScript origins добавьте адрес фронтенда (например
   `https://your-site.com` и `http://localhost:3000` для разработки).
3. Полученный Client ID пропишите в `backend/.env` как `GOOGLE_CLIENT_ID`
   и передайте на фронтенд через `window.__GOOGLE_CLIENT_ID__` (см. ниже).

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

## Настройка Google Client ID на фронтенде

Аналогично `__API_BASE__`, до подключения `auth.js` задайте:

```html
<script>window.__GOOGLE_CLIENT_ID__ = "ваш-client-id.apps.googleusercontent.com";</script>
```

Это тот же Client ID, что указан в `GOOGLE_CLIENT_ID` на бэкенде.
