# NESTA — жилая недвижимость Амстердама

Промо-сайт **NESTA** на Payload 3 + Next.js 16: главная по Figma, CMS с локализацией RU/EN, Live Preview в админке.

Макет: [nesta_promo (Figma)](https://www.figma.com/design/p9mgvNBdfGlU7dB3XjaVt2/nesta_promo)

## Стек

| Слой | Технологии |
| --- | --- |
| Фронтенд | Next.js 16, React 19, CSS |
| CMS | Payload 3.89, Lexical, RU/EN UI + локализация контента, Live Preview |
| Данные | Vercel Postgres / Neon (локально Docker) |
| Файлы | Vercel Blob (прод), диск локально |

## Возможности этапа 1

- Главная: header, hero + поиск (UI), curated properties, footer
- Админка: переключатель языка интерфейса (cookie `payload-lng`) и язык контента (RU/EN)
- Live Preview для pages, properties, neighborhoods, header, footer, site-settings
- Seed стартового контента

## Локальный запуск

Нужны Node.js 20+ и Docker:

```bash
cp .env.example .env
docker compose up -d
npm install
npm run dev
```

В другом терминале (после первого старта, когда схема создана):

```bash
npm run seed -- --force
```

- Сайт: http://localhost:3000  
- Админка: http://localhost:3000/admin  

## Скрипты

| Команда | Назначение |
| --- | --- |
| `npm run dev` | Dev-сервер |
| `npm run seed` | Seed (если пусто) |
| `npm run seed -- --force` | Перезаписать seed |
| `npm run generate:types` | Типы Payload |
| `npm run generate:importmap` | Import map админки |

## Маршруты

| Путь | Содержание |
| --- | --- |
| `/` | Главная |
| `/properties/[slug]` | Заглушка карточки (для Live Preview) |
| `/admin` | Payload admin |
