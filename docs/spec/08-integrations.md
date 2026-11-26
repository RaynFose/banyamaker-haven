# 08. Интеграции

| Сервис | Для чего | Стоимость | Этап |
|---|---|---|---|
| **Hostinger Business** | Node.js app (prod + staging), MySQL, cron, почта, SSL | уже оплачен | 1 |
| **Cloudflare** (DNS, CDN, Turnstile, R2) | быстрая отдача фото, защита форм, хранение фото и дампов | Free (R2: 10 GB бесплатно) | 1 |
| **Email через SMTP Hostinger** | письма клиентам (заявка принята, бронь, этап 2 — заказы) | входит в тариф | 1 |
| **Telegram Bot API** | уведомления персоналу о заявках и бронях | бесплатно | 1 |
| **Viber / WhatsApp** | кнопки связи с готовым текстом (`viber://chat?number=`, `https://wa.me/370…?text=`) | бесплатно | 1 |
| **Google Analytics 4 + GTM** | цели: `generate_lead` (по типам заявок), `click_call`, `click_viber`, `click_whatsapp`, `view_item`, `reserve`; на этапе 2 — `purchase`. Consent Mode v2 | бесплатно | 1 |
| **Google Search Console** | индексация, контроль миграции | бесплатно | 1 |
| **Google Places API** | рейтинг и отзывы на сайте (раз в сутки → `ReviewCache`) | в пределах бесплатного лимита | 1 |
| **Sentry, UptimeRobot** | ошибки и доступность | Free | 1 |
| **Montonio Payments** | банковские ссылки, карты, Apple/Google Pay, рассрочка; webhook с проверкой подписи; refund API | комиссия с платежа | 2 |
| **Montonio Shipping** | пакоматы Omniva / LP Express / DPD (список, на этапе 3 — этикетки) | по тарифам перевозчиков | 2 |
| **Google Merchant Center** | телефоны в Google Shopping (бесплатные листинги): фид `/api/feeds/google-merchant.xml`, `condition = used / refurbished / new` | бесплатно | 3 |
| **Facebook / Instagram Catalog, Meta Pixel** | каталог и реклама в соцсетях | бесплатно (реклама отдельно) | 3 |
| **skelbiu.lt** | экспорт объявления из карточки в 1 клик (текст + фото) | — | 3 |
| **SMS-провайдер** | напоминания о записи, статусы ремонта | платно за сообщение | 4 (по желанию) |
| **Dokobit (Smart-ID / eParaksts)** | удалённая подпись договора скупки | платно | 4 (по желанию) |
| **Бухгалтерия** (Rivilė / B1.lt / Centas) | этап 2: экспорт CSV; этап 4: API | — | 2 / 4 |

## Правила
- Внешние отправки (письма, Telegram, фиды) идут через очередь `Job` с повторами. Отправка не должна ломать сохранение заявки: заявка сохраняется всегда, уведомление догоняет.
- Webhooks идемпотентны.
- Ключи хранятся только в переменных окружения hPanel; в админке видно лишь «Prijungta ✓ / ✗» и кнопка «Testuoti».
- На staging письма уходят только на адреса персонала, Montonio в тестовом режиме, Telegram в отдельный тестовый чат.
