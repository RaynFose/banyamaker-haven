# 08. Интеграции

| Сервис | Для чего | Как | Этап |
|---|---|---|---|
| **Montonio Payments** | банковские ссылки (Swedbank, SEB, Luminor, Šiaulių, Revolut…), карты, Apple/Google Pay, рассрочка (Inbank / Montonio Financing) | создание заказа через API → редирект → webhook `paid` (проверка JWT-подписи) → идемпотентная обработка по `providerRef`; refund API | 1 |
| Paysera (альтернатива) | то же | Checkout API + callback | — |
| **Montonio Shipping** | Omniva, LP Express, DPD: список пакоматов, создание отправки, PDF-этикетка, трекинг | API pickup points (кэш на 24 ч), webhook статуса | 1 (пакоматы) / 2 (этикетки) |
| **Email: Postmark / Resend** | транзакционные письма | React Email шаблоны, 3 языка, DKIM/SPF/DMARC на домене | 1 |
| **SMS** (Messente / Infobip / Twilio) | коды, статусы, напоминания | отправка через очередь pg-boss, лог в `NotificationLog`, sender ID «ManoPhone» | 1 |
| **Viber / WhatsApp** | кнопки связи | deep links `viber://chat?number=`, `https://wa.me/370…?text=` с SKU или номером заказа | 1 |
| **Google Business Profile / Places API** | рейтинг и отзывы на сайте | задача раз в сутки → `ReviewCache`; на сайте показывается ссылка «Visi atsiliepimai Google» | 1 |
| **Google Analytics 4 + GTM** | аналитика, цели | Consent Mode v2; события: `view_item`, `add_to_cart`, `begin_checkout`, `purchase`, `generate_lead` (запись, скупка, форма), `click_call`, `click_viber`, `click_whatsapp` | 1 |
| **Google Search Console** | индексация, контроль миграции | верификация через DNS, отправка sitemap | 1 |
| **Meta Pixel + Conversions API** | реклама и ремаркетинг | server-side события после согласия | 2 |
| **Google Merchant Center** | товары в Google Shopping (в том числе бесплатные листинги) | фид `/api/feeds/google-merchant.xml` (`condition = used/refurbished/new`, `identifier_exists = no` для б/у) | 2 |
| **Facebook / Instagram Catalog** | тот же каталог в соцсетях | тот же фид (CSV/XML) | 2 |
| **skelbiu.lt** | объявления (компания уже продаёт там как «manophone») | 2-й этап: экспорт CSV или текста объявления в 1 клик из карточки товара; API выяснить | 2–3 |
| **Telegram Bot API** | уведомления персоналу | бот в группе персонала | 1 |
| **Cloudflare** | DNS, CDN, WAF, Turnstile (капча), R2 (фото, бэкапы) | | 1 |
| **Sentry** | ошибки фронта и бэка | | 1 |
| **Бухгалтерия** (Rivilė / B1.lt / Centas) | выгрузка продаж и счетов | 1-й этап: экспорт CSV/XLSX; 2-й: API | 2 |
| **Smart-ID / eParaksts** | удалённая подпись договора скупки | через Dokobit API | 3 |
| **IMEI-проверка** | blacklist, iCloud | сервис IMEI.info / CheckMEND, ручная проверка из админки | 2 |

## Общие правила
- Все внешние вызовы (кроме синхронных платёжных) идут через очередь с повторами (экспоненциальная задержка, 5 попыток) и логом.
- Webhooks идемпотентны: повторный `paid` ничего не ломает.
- Ключи хранятся только в env. В админке видно только «Prijungta ✓ / ✗» и кнопка «Testuoti».
- В staging используются тестовые ключи Montonio и «песочница» SMS (сообщения пишутся в лог, не отправляются).
