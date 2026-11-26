# 01. Архитектура (Hostinger Business)

## 1. Что даёт Hostinger Business и как мы это используем
| Возможность тарифа | Использование |
|---|---|
| Node.js web apps (до 5), официальная поддержка Next.js, деплой из GitHub | 1 приложение для prod, 1 для staging (`staging.mano-phone.lt`), остальные слоты свободны |
| MySQL / MariaDB | основная БД (prod и staging отдельно) |
| Cron jobs в hPanel | раз в минуту вызывает `/api/cron` (очередь задач, снятие брони, письма) |
| Email-хостинг | `info@mano-phone.lt`, отправка писем через SMTP (nodemailer) |
| SSL, CDN, ежедневные бэкапы | используем как есть + свой дамп БД в R2 |

**Ограничения тарифа** и как мы их обходим:
| Ограничение | Решение |
|---|---|
| Нет PostgreSQL | MySQL; поиск по нормализованному полю `searchText` (каталог небольшой, сотни строк) |
| Нет постоянных фоновых процессов | таблица `Job` + cron (см. §4) |
| Запрос обрывается через 120 с | долгих операций нет; импорт CSV идёт частями |
| Общие память и CPU | без тяжёлой обработки на сервере: фото сжимаются в браузере, оптимизация `next/image` выключена (готовые размеры из R2) |
| Сборка может падать на больших проектах | при необходимости сборка в GitHub Actions, на хостинг уходит готовый `standalone` |
| Нет WebSockets | не нужны |

Если сайт перерастёт тариф, переезд на VPS сводится к смене `DATABASE_URL` и деплоя. Код от хостинга не зависит.

## 2. Стек
| Слой | Технология |
|---|---|
| Фреймворк | Next.js (App Router, Server Components, Server Actions), `output: "standalone"` |
| Язык | TypeScript (strict) |
| UI | Tailwind CSS + shadcn/ui + lucide-react |
| Формы | react-hook-form + zod (одни схемы на клиенте и сервере) |
| Таблицы в админке | TanStack Table |
| i18n | next-intl: `lt` по умолчанию без префикса, `/ru`, `/en` под флагом |
| ORM / БД | Prisma + MySQL (`utf8mb4_unicode_ci`) |
| Аутентификация персонала | Auth.js (credentials) + TOTP 2FA |
| Фото | Cloudflare R2 (S3 API), загрузка по presigned URL прямо из браузера; перед загрузкой браузер делает WebP 400/800/1600 px (`browser-image-compression`) |
| PDF (этап 2) | @react-pdf/renderer: счета |
| Email | React Email + nodemailer через SMTP Hostinger |
| Уведомления персоналу | Telegram Bot API |
| Капча | Cloudflare Turnstile |
| Мониторинг | Sentry (free), UptimeRobot (free) |
| Тесты | Vitest (цены, расчёт скупки, резерв) + Playwright (заявка, бронь, оплата) |
| CI | GitHub Actions: lint → typecheck → test → build |

## 3. Структура репозитория
```
mano-phone-web/
├─ app/
│  ├─ [locale]/(site)/
│  │  ├─ page.tsx                       # главная
│  │  ├─ telefonai/ page.tsx, [slug]/   # витрина
│  │  ├─ remontas/[model]/              # прайс модели
│  │  ├─ iphone-remontas/ ...           # посадочные (сохранённые URL)
│  │  ├─ telefonu-remonto-kaina/        # калькулятор
│  │  ├─ supirkimas/ ...                # скупка + калькулятор
│  │  └─ [...slug]/                     # CMS-страницы (informacija/*, юр., города)
│  ├─ admin/                            # админка
│  ├─ api/
│  │  ├─ cron/route.ts                  # вызывается cron hPanel
│  │  ├─ upload/route.ts                # presigned URL для R2
│  │  └─ webhooks/montonio/route.ts     # этап 2
│  ├─ sitemap.ts  robots.ts
├─ components/ (ui/, site/, admin/)
├─ lib/
│  ├─ db.ts  auth.ts  i18n.ts  search.ts (нормализация текста)
│  ├─ services/     # repairPrices, inventory, leads, buyback, orders
│  ├─ integrations/ # r2.ts  mail.ts  telegram.ts  montonio.ts
│  └─ jobs/         # обработчики задач из таблицы Job
├─ emails/  messages/{lt,ru,en}.json
├─ prisma/ schema.prisma  migrations/  seed/ (repair-prices.json, redirects.csv)
└─ middleware.ts    # локаль, редиректы, защита /admin
```
Правило: страницы и Server Actions работают с данными только через `lib/services/*`.

## 4. Фоновые задачи без воркера
- Любое отложенное действие — строка в `Job` (`type`, `payload`, `runAt`).
- Cron hPanel раз в минуту: `curl -s -H "Authorization: Bearer $CRON_SECRET" https://mano-phone.lt/api/cron`.
- `/api/cron` берёт до 20 задач с `runAt <= now AND doneAt IS NULL` (блокировка `SELECT … FOR UPDATE SKIP LOCKED`, MariaDB ≥ 10.6 / MySQL 8), выполняет, ставит `doneAt`. При ошибке `attempts + 1` и повтор через 2^n минут, максимум 5 попыток.
- **Резерв не зависит от cron:** товар считается свободным, если `status = RESERVED AND reservedUntil < now()`. Cron только приводит статус в порядок.
- Задачи: письма клиенту, сообщения в Telegram, снятие истёкших броней, рассылка StockAlert, синхронизация отзывов Google (раз в сутки), дамп БД в R2 (раз в сутки), очистка `NotFoundLog`.

## 5. Рендеринг и кэш
| Страницы | Режим | Обновление |
|---|---|---|
| Главная, посадочные, прайсы моделей, города, контент | ISR | `revalidateTag` при сохранении в админке (цена → тег `repair-prices`) |
| Витрина и карточки телефонов | ISR 60 с + `revalidateTag('inventory')` | продажа или бронь сразу убирает товар |
| Формы, админка, корзина | динамические | без кэша |

## 6. Окружения и деплой
| Окружение | Где | Ветка |
|---|---|---|
| local | `npm run dev` + MySQL в Docker | — |
| staging | Hostinger Node.js app №2, `staging.mano-phone.lt`, Basic Auth, `noindex`, своя БД | `develop` |
| production | Hostinger Node.js app №1, `mano-phone.lt` | `main` |

- В hPanel: Websites → Add website → Node.js app → подключить GitHub-репозиторий и ветку. Переменные окружения задаются в hPanel.
- Миграции БД: `prisma migrate deploy` выполняется на этапе сборки (build command: `prisma migrate deploy && next build`).
- Переменные: `DATABASE_URL`, `AUTH_SECRET`, `CRON_SECRET`, `R2_ACCOUNT_ID/ACCESS_KEY/SECRET/BUCKET/PUBLIC_URL`, `SMTP_HOST/USER/PASS`, `TELEGRAM_BOT_TOKEN/CHAT_ID`, `TURNSTILE_*`, `SENTRY_DSN`, `GOOGLE_PLACES_KEY`; на этапе 2 ещё `MONTONIO_*`.
- **Переключение со старого сайта:** WordPress и новый сайт живут на одном тарифе. Новый сайт собирается на staging-домене; в день запуска домен `mano-phone.lt` привязывается к Node.js-приложению, а WP переезжает на `old.mano-phone.lt` (с паролем) на 3 месяца.

## 7. Безопасность и GDPR
- Админка: 2FA, rate-limit на вход, журнал действий (`AuditLog`), `noindex`.
- IMEI и закупочные цены видят только роли OWNER и MANAGER.
- Формы: Turnstile + honeypot + rate-limit. Согласие с политикой конфиденциальности под каждой формой.
- Cookie-баннер + Google Consent Mode v2; аналитика грузится только после согласия.
- Заявки хранятся 24 месяца, потом анонимизируются (задача cron).
- Паспортные данные на этапах 1–3 **не собираются**: договор скупки оформляется в салоне как сейчас. На этапе 4 — шифрование полей (см. 02 §5).
- Бэкапы: Hostinger (ежедневно) + свой дамп в R2 (ежедневно, хранение 30 дней).

## 8. Производительность
- Цель: LCP < 2.0 s, INP < 200 ms, CLS < 0.1 на мобильном (Lighthouse CI в пайплайне).
- JS на публичной странице < 120 KB gzip, один variable-шрифт (latin-ext + cyrillic).
- Фото из R2 через Cloudflare CDN, `<img srcset>` с тремя готовыми размерами, lazy-загрузка.
