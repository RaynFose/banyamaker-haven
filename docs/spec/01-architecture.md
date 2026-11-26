# 01. Архитектура

## 1. Стек
| Слой | Технология | Примечание |
|---|---|---|
| Фреймворк | Next.js (App Router, Server Components, Server Actions) | публичные страницы SSG/ISR, админка динамическая |
| Язык | TypeScript (strict) | |
| UI | Tailwind CSS + shadcn/ui (Radix) + lucide-react | одна дизайн-система для сайта и админки |
| Формы | react-hook-form + zod | одни zod-схемы на клиенте и сервере |
| Таблицы в админке | TanStack Table | сортировка, фильтры, массовые действия |
| i18n | next-intl | `lt` по умолчанию без префикса, `/ru`, `/en` |
| ORM / БД | Prisma + PostgreSQL 16 (расширения `pg_trgm`, `unaccent`) | поиск «iphone 13 pro» / «ifone» / без диакритики |
| Аутентификация | Auth.js (credentials для персонала + TOTP 2FA), magic-link / SMS-код для клиентов | |
| Очередь задач | pg-boss (очередь на Postgres) | email, SMS, напоминания, снятие брони, фиды; без Redis |
| Файлы | Cloudflare R2 (S3 API) + sharp | WebP/AVIF, 3 размера, EXIF-strip |
| PDF | @react-pdf/renderer | счета, гарантийные талоны, акт приёма, договор скупки |
| Email | React Email + Postmark (или Resend) | транзакционные письма на 3 языках |
| SMS | провайдер с LT-номерами (напр. Twilio / Messente / Infobip) | статусы, коды, напоминания |
| Мониторинг | Sentry (ошибки), Uptime Kuma / Better Stack (доступность), логи pino | |
| Тесты | Vitest (логика), Playwright (e2e: заказ, запись, скупка) | |
| CI/CD | GitHub Actions: lint → typecheck → test → build → docker image → deploy | |

## 2. Структура репозитория
```
mano-phone-web/
├─ app/
│  ├─ [locale]/(site)/            # публичный сайт
│  │  ├─ page.tsx                 # главная
│  │  ├─ telefonai/               # каталог продажи
│  │  │  ├─ page.tsx
│  │  │  └─ [slug]/page.tsx
│  │  ├─ remontas/[model]/        # прайс модели
│  │  ├─ iphone-remontas/ ...     # посадочные (сохранённые URL)
│  │  ├─ supirkimas/ ...
│  │  ├─ krepselis/  uzsakymas/  statusas/  paskyra/
│  │  └─ [...slug]/page.tsx       # CMS-страницы (informacija/*, юр. страницы)
│  ├─ admin/                      # админка (без локали, интерфейс LT/RU)
│  ├─ api/
│  │  ├─ webhooks/montonio/route.ts
│  │  ├─ webhooks/shipping/route.ts
│  │  └─ feeds/google-merchant.xml/route.ts
│  ├─ sitemap.ts  robots.ts
├─ components/  (ui/, site/, admin/)
├─ lib/
│  ├─ db.ts  auth.ts  i18n.ts
│  ├─ services/   # бизнес-логика: orders, inventory, repairs, buyback, pricing
│  ├─ integrations/  montonio.ts  shipping.ts  sms.ts  email.ts  storage.ts
│  └─ jobs/       # обработчики pg-boss
├─ emails/  pdf/  messages/{lt,ru,en}.json
├─ prisma/  schema.prisma  migrations/  seed/ (импорт repair-prices.json, redirects.csv)
├─ middleware.ts  # локаль, редиректы из БД, защита /admin
├─ tests/  e2e/
└─ docker/  Dockerfile  compose.yml  Caddyfile
```
Правило: страницы и Server Actions **не** ходят в Prisma напрямую, только через `lib/services/*`. Так логика (резерв товара, смена статусов, расчёт цены) живёт в одном месте и покрывается тестами.

## 3. Рендеринг и кэш
| Тип страницы | Режим | Инвалидация |
|---|---|---|
| Главная, посадочные, прайсы моделей, города, блог | SSG + ISR | `revalidateTag('repair-prices')`, `('page:<slug>')` при сохранении в админке |
| Каталог / карточка телефона | ISR (60 с) + `revalidateTag('inventory')` при изменении товара | статус «продан» должен пропадать сразу, поэтому тег |
| Корзина, оформление, статус ремонта, кабинет | динамические | без кэша |
| Админка | динамическая, `noindex` | |

## 4. Окружения
| Окружение | URL | Данные |
|---|---|---|
| local | localhost:3000 | Docker Postgres, seed из `docs/migration/*` |
| staging | staging.mano-phone.lt (Basic Auth, `noindex`) | копия prod без персональных данных; тестовые ключи Montonio |
| production | mano-phone.lt | |

Переменные окружения: `DATABASE_URL`, `AUTH_SECRET`, `R2_*`, `MONTONIO_ACCESS_KEY/SECRET_KEY`, `POSTMARK_TOKEN`, `SMS_*`, `SENTRY_DSN`, `GOOGLE_PLACES_KEY`, `ENCRYPTION_KEY` (для паспортных данных скупки). Секреты не хранятся в репозитории.

## 5. i18n
- Языки: `lt` (default, без префикса), `ru` (`/ru/...`), `en` (`/en/...`). Включение языка задаётся флагом в `Setting`.
- Тексты интерфейса хранятся в `messages/*.json`, контент из БД — в полях `LocalizedText` (`{ lt, ru?, en? }`).
- Slug локализуются только для страниц (`/ru/remont-iphone/`). Модели и товары используют один slug.
- `hreflang` и `x-default` (= lt) на каждой странице. Если перевода нет, страница на этом языке не генерируется и в sitemap не попадает.

## 6. Безопасность и GDPR
- В админке: 2FA обязательна, сессия 12 ч, rate-limit на логин, журнал действий (`AuditLog`).
- Паспортные данные продавцов (скупка): шифрование на уровне поля (AES-256-GCM, ключ в env). Доступ только у ролей `owner` и `buyer`, каждый просмотр пишется в журнал. Срок хранения задаётся настройкой (по умолчанию 10 лет, уточнить у юриста). Документ удаляется автоматически по истечении срока.
- IMEI и серийные номера видит только персонал. На витрине показывается «IMEI patikrintas».
- Формы: honeypot + Cloudflare Turnstile, rate-limit по IP.
- Заголовки: CSP, HSTS, `X-Frame-Options`, `Referrer-Policy`.
- Cookie-баннер с Google Consent Mode v2. Аналитика грузится только после согласия.
- Бэкапы: `pg_dump` каждую ночь в R2, хранение 30 дней. Восстановление на staging проверяется раз в месяц.

## 7. Деплой
- Hetzner CX32 (или аналог), Ubuntu, Docker Compose: `app` (Next standalone), `worker` (pg-boss), `postgres`, `caddy` (TLS).
- GitHub Actions собирает образ, кладёт его в GHCR, деплоит по SSH (`docker compose pull && up -d`), выполняет `prisma migrate deploy`.
- Cloudflare перед сервером: DNS, CDN для `/_next/static` и изображений, WAF.
- Альтернатива без сервера: Vercel + Neon + отдельный воркер (Railway / Fly). Дороже, зато меньше администрирования.

## 8. Производительность (бюджет)
- LCP < 2.0 s, INP < 200 ms, CLS < 0.1 на мобильном 4G (проверка Lighthouse CI в пайплайне).
- JS на публичной странице < 120 KB gzip. Без тяжёлых каруселей, шрифт один (variable, `font-display: swap`, сабсет latin-ext + cyrillic).
- Все изображения через `next/image`, с `sizes` и lazy.
