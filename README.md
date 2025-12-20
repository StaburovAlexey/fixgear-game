# FixGear Game — пет‑проект на Pixi.js

**Поиграть:** [t.me/dev_fgr_bout_bot?startapp](https://t.me/dev_fgr_bout_bot?startapp) — уже зашло ~20 человек.

Небольшая игра, которую я веду в свободное время, чтобы прокачивать Pixi.js, Vue 3 и Telegram Web Apps.

## Что внутри
- Рендер сцены и анимации в Pixi.js, UI на Vue 3.
- Telegram Web App: берем `initData` для аутентификации и привязываем результаты к пользователю.
- Лидерборды: очки по главам/режимам отправляются на сервер, строится таблица лидеров и сохраняется прогресс.

## Как развивался проект
- Стартовал как фронт на Vue 3 + Vite с моковыми данными.
- Добавил Pixi.js, чтобы отделить канвас‑графику от UI.
- Подключил Telegram WebApp SDK для работы с `initData`.
- Первая версия бэкенда была на Supabase (users/scores).
- Вынес сервер в отдельный Fastify + SQLite проект с проверкой подписи Telegram: [server-fgr-bout](https://github.com/StaburovAlexey/server-fgr-bout).
- Переписал фронт на REST эндпоинты нового сервера (auth, users, scores, лидерборды), оставив модель данных прежней.

## Стек
- Frontend: Vue 3 (`<script setup>`), Vite, Pixi.js.
- Backend: Fastify + SQLite — репозиторий: [server-fgr-bout](https://github.com/StaburovAlexey/server-fgr-bout).
- Интеграции: Telegram Web Apps `initData`, PM2/nginx для деплоя.

