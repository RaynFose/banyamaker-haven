# 03. Публичные страницы

На этапе 1 делаются все страницы, кроме помеченных «этап 2» и «этап 4».

Общие элементы на каждой странице:
- **Шапка:** логотип · Remontas ▾ · Telefonai · Supirkimas · Kainos · Kontaktai · переключатель языка (этап 3) · телефон-кнопка · корзина (этап 2).
- **Плавающая панель на мобильном:** 📞 Skambinti · Viber · WhatsApp · «Užklausa».
- **Футер:** адрес + мини-карта, часы, телефон, email, соцсети (один Facebook), реквизиты UAB, юр. ссылки, способы оплаты и доставки.
- **SEO-база:** уникальные `title`/`description`, canonical, OG-картинка (генерируется через `next/og`), `BreadcrumbList`, `hreflang`.

## 1. Карта сайта (LT)
| URL | Шаблон | Статус URL | Schema.org |
|---|---|---|---|
| `/` | Главная | keep | `MobilePhoneRepair` + `WebSite` |
| `/telefonai/` | Каталог продажи | новый | `CollectionPage`, `ItemList` |
| `/telefonai/{brand}/` | Каталог, фильтр по бренду | новый | `ItemList` |
| `/telefonai/{item-slug}/` | Карточка телефона | новый | `Product` + `Offer` (`itemCondition`) |
| `/telefonu-remontas/` | Хаб ремонта телефонов | keep | `Service` |
| `/iphone-remontas/` | Бренд-посадочная | keep | `Service` + `FAQPage` |
| `/samsung-remontas/` | Бренд-посадочная | новый (← `/gamintojai/samsung-telefonai/`) | `Service` + `FAQPage` |
| `/ipad-remontas/`, `/macbook-remontas/`, `/apple-watch-remontas/` | Бренд-посадочная | новые / 301 | `Service` |
| `/planseciu-remontas/`, `/kompiuteriu-remontas/` | Хаб категории | keep | `Service` |
| `/apple-remontas/` | Хаб Apple | keep | `Service` |
| `/remontas/{model}/` | Прайс модели | новый (← `/prietaisai/{model}/`) | `Service` + `Offer` по работам, `FAQPage` |
| `/telefonu-remonto-kaina/` | Калькулятор цены | keep | `WebApplication` |
| `/registracija/` | Онлайн-запись по слотам (**этап 4**; на этапе 1 — форма заявки) | новый | — |
| `/statusas/` | Статус ремонта (**этап 4**) | новый, `noindex` | — |
| `/remontas-pagal-miesta/` | «Remontas visoje Lietuvoje» (почта/курьер) | keep | `Service` (areaServed: LT) |
| `/remontas-pagal-miesta/telefonu-taisykla-{city}/` | Город (11 шт.) | keep | `Service` (areaServed: city) |
| `/supirkimas/` + 4 подстраницы | Скупка + калькулятор | keep | `Service`, `FAQPage` |
| `/krepselis/` → `/uzsakymas/` → `/uzsakymas/{number}/aciu/` | Корзина и оформление (**этап 2**) | `noindex` | — |
| `/paskyra/` | Кабинет клиента (**этап 3–4**); до этого 301 на главную | `noindex` | — |
| `/kontaktai/` | Контакты | keep | `MobilePhoneRepair` |
| `/informacija/` + 5 подстраниц | Инфо (о нас, DUK, сроки, данные, вода) | keep | `FAQPage` где уместно |
| `/blogas/`, `/blogas/{slug}/` | Блог | новый (← корневые slug) | `BlogPosting` |
| `/privatumo-politika/`, `/slapuku-politika/`, `/pirkimo-taisykles/`, `/grazinimas/`, `/garantija/` | Юр. страницы | новые | — |

## 2. Главная `/`
1. **Hero:** H1 «Telefonų remontas Vilniuje ir parduotuvė», подзаголовок (сроки, гарантия, бесплатная диагностика), 2 CTA: «Sužinoti kainą» (открывает калькулятор) и «Pirkti telefoną». Справа фото салона или мастера (не эмодзи).
2. **Быстрый калькулятор:** поле «Jūsų modelis» с автодополнением → список поломок → цена и время → «Palikti užklausą».
3. **Доверие:** живой рейтинг Google (число отзывов + ссылка), «20 000+ sutaisytų», «3 mėn. garantija», «Nemokamas pakaitinis telefonas». Каждая цифра должна быть подтверждаемой.
4. **Услуги:** 4 карточки: Remontas, Telefonai parduoti, Supirkimas / trade-in, Remontas paštu.
5. **Свежие поступления:** 8 карточек из `InventoryItem LISTED` + «Visi telefonai».
6. **Популярные ремонты:** топ-12 моделей (iPhone 13–17, Galaxy S23–S25, A5x) со ссылками на прайсы.
7. **Как это работает:** 3 шага.
8. **Отзывы:** 6 из `ReviewCache`.
9. **FAQ:** 5–6 вопросов (`FAQPage`).
10. **Салон:** карта, фото входа «IKI, 2 aukštas», парковка, часы работы, «Atidaryta dabar / Uždaryta» (считается по `Setting.hours`).

## 3. Каталог `/telefonai/`
- Слева фильтры (на мобильном — шторка), справа сетка карточек. Фильтры сохраняются в URL (`?brand=apple&storage=256&grade=A`), но canonical указывает на страницу без параметров; страницы брендов индексируются.
- Карточка в сетке: фото, «iPhone 14 Pro · 256 GB · Deep Purple», бейдж класса, 🔋 89 %, цена, старая цена, «Garantija 6 mėn.», «Rezervuoti».
- Пустой результат: «Šiuo metu tokio nėra» + форма подписки `StockAlert`.
- Подробно: [04-catalog-checkout.md](04-catalog-checkout.md).

## 4. Прайс модели `/remontas/{model}/`
1. H1 «iPhone 13 Pro remontas», фото модели, короткий текст (уникальный, из `DeviceModel.repairIntro`).
2. **Таблица цен** (`<table>`): Работа · Деталь (Originalas / Analogas) · Kaina · Trukmė · Garantija · кнопка «Registruotis». Можно отметить несколько работ, итог считается внизу.
3. «Nežinote gedimo? Nemokama diagnostika» → форма.
4. Как отправить из другого города (Omniva / LP Express / автобус / курьер).
5. Похожие модели и «Šį modelį taip pat parduodame» (если есть в наличии).
6. FAQ по модели.

## 5. Скупка `/supirkimas/`
Калькулятор оценки (см. [06-buyback.md](06-buyback.md)) сразу на первом экране, ниже преимущества, процесс, документы и FAQ.

## 6. Контакты `/kontaktai/`
H1, карта (статичное превью + кнопка «Atidaryti Google Maps», чтобы не грузить iframe до клика), адрес с ориентиром, фото входа, часы работы, телефон / Viber / WhatsApp / email, форма (имя, **телефон**, сообщение, тема-селект), реквизиты.

## 7. Городские страницы (11 шт.)
Шаблон `city`: как отправить телефон из {города} (ближайшие пакоматы, автобусная посылка, срок «2–3 d.d.»), реальная стоимость доставки, отзывы клиентов из этого города (если есть), 3 популярные модели, CTA «Siųsti telefoną» (форма `MAIL_IN`). Текст пишется для каждого города отдельно, без замены одного слова.
Оставшиеся ~90 городских URL получают 301 на хаб `/remontas-pagal-miesta/`.

## 8. Страница статуса `/statusas/` (этап 4)
Ввод «Užsakymo nr.» + последние 4 цифры телефона, либо прямая ссылка из SMS `/statusas/{publicToken}`. Показывает модель, текущий статус (прогресс-бар), ленту событий (`publicNote`), сумму к оплате, кнопки «Patvirtinti kainą» / «Atsisakyti» (если статус `AWAITING_APPROVAL`), гарантию до даты и PDF-талон.
