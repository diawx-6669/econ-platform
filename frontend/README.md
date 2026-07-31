# Frontend

Статические HTML/CSS/JS, сборка не требуется.

```
public/
├── index.html            # экран входа / регистрации
├── dashboard.html         # заглушка личного кабинета
└── assets/
    ├── css/main.css        # фон, layout, брендовая панель
    ├── css/auth.css         # карточка формы
    └── js/auth.js            # табы, валидация, запросы к API
```

## Запуск

```bash
npx serve public
```

или просто откройте `public/index.html` в браузере.

## Подключение к другому API

```html
<script>window.__API_BASE__ = "https://api.your-domain.com/api";</script>
<script src="assets/js/auth.js"></script>
```
