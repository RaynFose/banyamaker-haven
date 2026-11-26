# 09. SEO и миграция с WordPress

## 1. Карта URL (`docs/migration/redirects.csv`)
Собрана из всех sitemap текущего сайта (page, post, prietaisai, category) + служебных URL WP.

| Действие | Кол-во | Что |
|---|---|---|
| keep | 33 | главная, хабы ремонта, `/iphone-remontas/`, `/telefonu-remonto-kaina/`, скупка (5), инфо (6), контакты, 11 городов, корзина и кабинет |
| 301 | 233 | 99 моделей `/prietaisai/{m}/` → `/remontas/{m}/` · ~90 городских страниц → хаб · дубли `-2` → основной URL · пустые категории брендов → хабы · `/gamintojai/apple-telefonai/` → `/iphone-remontas/` · `/gamintojai/samsung-telefonai/` → `/samsung-remontas/` · пустые WooCommerce-страницы (`/shop/`, `/parduotuve/`, `/cart/`, `/checkout/`, `/wishlist/`, `/dalys-telefonams/` …) → `/telefonai/` или `/krepselis/` · `/iphone-remontasgg/` → `/iphone-remontas/` · блог → `/blogas/{slug}/` · `/privacy-policy-2/` → `/privatumo-politika/` · `/naudojimo-salygos/` → `/pirkimo-taisykles/` |
| 410 | 7 | `/feed/`, `/comments/feed/`, `/xmlrpc.php`, `/wp-login.php`, `/wp-admin/`, `/wp-json/`, `/locations.kml` |

Реализация: таблица `Redirect`, проверка в `middleware.ts` (кэш в памяти, обновление при изменении). Счётчик переходов показывает, какие редиректы ещё нужны. Плюс «404 žurnalas»: каждый 404 пишется в лог, и из него можно одним кликом создать редирект.

## 2. Перед запуском (за 1–2 недели)
- [ ] Выгрузить из Search Console «Puslapiai» и «Našumas» за 16 месяцев: топ-URL по кликам и запросам; убедиться, что у каждого есть keep или 301 на релевантную страницу.
- [ ] Снять текущие позиции (20–50 ключевых запросов: «telefonų taisykla vilnius», «iphone remontas», «iphone ekrano keitimas kaina», «samsung ekrano keitimas», «telefonų supirkimas» …), чтобы было с чем сравнить.
- [ ] Скопировать все тексты и метаданные старого сайта в архив (на случай, если что-то потеряется).
- [ ] Прогнать краулер (Screaming Frog или свой скрипт) по staging: нет 404, нет цепочек редиректов, у каждой страницы уникальный title и description, есть canonical и hreflang.
- [ ] Прогнать весь `redirects.csv` скриптом против staging: каждая строка отдаёт ожидаемый код и Location.

## 3. День запуска
- [ ] TTL DNS заранее снизить до 300 с. Переключить A-запись на новый сервер (Cloudflare).
- [ ] Проверить HTTPS, `www` → без `www` (301), `http` → `https`.
- [ ] `robots.txt` (prod) разрешает индексацию, `sitemap.xml` отдаётся; отправить sitemap в Search Console.
- [ ] Тестовый заказ с реальной оплатой 1 € и возвратом, тестовая запись, тестовая заявка на скупку.
- [ ] Проверить события GA4 в DebugView.
- [ ] Старый WP оставить на поддомене `old.` (закрыт паролем) на 3 месяца.

## 4. После запуска (4–6 недель)
- Каждый день: ошибки покрытия в Search Console, лог 404, Sentry.
- Каждую неделю: позиции по списку, клики и показы против базового уровня. Падение до 10–20 % в первые 2–4 недели нормально, дольше — повод разбираться.
- Обновить URL в Google Business Profile, Facebook и skelbiu.lt, если ссылки там вели на старые страницы.

## 5. Разметка (JSON-LD)
| Страница | Типы |
|---|---|
| Все | `Organization` (логотип, соцсети), `BreadcrumbList` |
| Главная, контакты | `MobilePhoneRepair` (подтип `LocalBusiness`): name, address, geo, `openingHoursSpecification`, telephone, priceRange «€€», `aggregateRating` (только из реальных отзывов Google, без выдуманных) |
| Прайс модели | `Service` (serviceType, provider, areaServed) + `OfferCatalog` с ценами работ + `FAQPage` |
| Карточка телефона | `Product` (brand, model, color, sku, image) + `Offer` (price, priceCurrency EUR, availability, `itemCondition`: NewCondition / UsedCondition / RefurbishedCondition, `hasMerchantReturnPolicy`, `shippingDetails`, warranty) |
| Каталог | `ItemList` |
| Блог | `BlogPosting` |

## 6. Контент: что переписать
- **Главная, бренд-страницы, хабы:** убрать переспам («iPhone remontas paslaugą», «iPhone 6 ekrano keitimas kaina poreikį»), сделать короче и полезнее, добавить реальные факты.
- **99 страниц моделей:** сейчас текст одинаковый с подменой названия. На запуске: уникальный абзац для топ-30 моделей, остальные получают шаблон + таблицу + FAQ (таблица цен сама по себе уникальна). Постепенно дописать остальные.
- **«Apie mus»:** переписать с нуля: история, команда с фото, салон, реальные цифры.
- **11 городов:** уникальные тексты (см. 03 §7).
- **Единые факты** (один источник в `Setting`): стаж, сроки, гарантия, количество ремонтов. На старом сайте они противоречат друг другу (5 / 8 / 10+ лет; 20 / 30–60 мин / 1 ч).
- **Блог:** 2 статьи в месяц по реальным запросам («kiek kainuoja iPhone baterijos keitimas», «ką daryti įmetus telefoną į vandenį», «kaip patikrinti naudotą iPhone prieš perkant»).
