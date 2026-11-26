# 02. Модель данных

Схема этапов 1–3: [schema.prisma](schema.prisma) (MySQL, проверена `prisma validate`).

## 1. Связи
```
Brand 1─* DeviceModel ─┬─* RepairPrice *─1 RepairType          (прайс ремонта)
                       ├─* InventoryItem ─* ItemPhoto           (телефоны на продажу)
                       ├─* BuybackBasePrice   + BuybackModifier (оценка скупки)
                       ├─* StockAlert                           («сообщить о поступлении»)
                       └─* Lead                                 (заявки)
InventoryItem ─* Lead (бронь / вопрос) ─* OrderLine ─1 Order ─* OrderEvent   (этап 2)
User ─* Lead (кто обработал)
Page, BlogPost, Faq, Redirect, NotFoundLog, ReviewCache, Setting, Job, AuditLog
```

## 2. Главные идеи
1. **DeviceModel — общий справочник** для прайса, витрины, скупки и заявок. Каждая модель заводится один раз.
2. **InventoryItem — конкретный экземпляр** со своим классом, батареей, фото и IMEI. Остатков нет: телефон либо в продаже, либо нет.
3. **Lead — единый «входящий ящик»** для всех заявок с сайта: ремонт, отправка почтой, бронь, вопрос по телефону, оценка скупки, общая форма. Тип определяет набор полей в `data`. На этапе 1 этого достаточно, чтобы ничего не терялось. На этапе 4 из заявки можно будет одной кнопкой создать тикет ремонта или скупку.
4. **Деньги хранятся в центах.** Переводимые поля — Json `{lt, ru?, en?}`.
5. **MySQL:** вместо массивов используется Json, для поиска — поле `searchText` (нижний регистр, без диакритики, с алиасами «ip13pro», «13 pro»). Нормализует его одна функция `lib/search.ts`, она же обрабатывает запрос.
6. **Номера:** `Z-2026-00042` (заявка), `U-2026-00042` (заказ, этап 2), `MP-000142` (SKU). Счётчики хранятся в `Setting` и увеличиваются в транзакции.
7. **Факты о компании** (стаж, гарантия, сроки, количество ремонтов, часы работы, телефон) хранятся в `Setting` и выводятся отовсюду из одного места: на старом сайте они противоречат друг другу.

## 3. Статусы
**InventoryItem:** `DRAFT → LISTED → RESERVED → SOLD`; из `RESERVED` по истечении срока или отмене — обратно в `LISTED`; `ARCHIVED` — снят. Публикация (`LISTED`) возможна только при заполненном чеклисте: ≥ 3 фото, цена, класс (для б/у), батарея, отметки «IMEI patikrintas» и «paskyra atsieta».

**Lead:** `NEW → IN_PROGRESS → DONE | CANCELLED`. Для брони (`RESERVATION`) при создании товар ставится в `RESERVED` с `reservedUntil` = сейчас + N часов (настройка), при `CANCELLED` он возвращается в `LISTED`, при `DONE` — переводится в `SOLD`.

**Order (этап 2):** `PENDING_PAYMENT → PAID → READY_FOR_PICKUP | SHIPPED → COMPLETED`; `PENDING_PAYMENT` → `CANCELLED` через 30 мин без оплаты; `COMPLETED → REFUNDED`.

## 4. Импорт с текущего сайта (seed)
| Источник | Куда |
|---|---|
| `migration/repair-prices.json` → `repair_types` | `RepairType` (20 типов, названия исправлены: «Ausinių», «Drėgmės», «Įjungimo») |
| `migration/repair-prices.json` → `devices` | `Brand` (Apple, Samsung, Google), `DeviceModel` (99), `RepairPrice` (1474) |
| `screen_original`, `housing` → `quality = ORIGINAL`; `back_glass` → `PREMIUM`; остальные → `NONE` | |
| `water_damage` → `isFromPrice = true` («nuo 30 €») | |
| `migration/redirects.csv` | `Redirect` (273) |
| Тексты страниц | вручную: переписываем, а не копируем (см. 09 §6) |

Добавить в справочник при запуске: iPhone 17 / 17 Air / 17 Pro / 17 Pro Max, Galaxy S25 / S25+ / S25 Ultra / S25 FE / S25 Edge, A16 / A26 / A36 / A56, Galaxy Z Fold / Flip, популярные Xiaomi / Redmi и Google Pixel. Категории Xiaomi, Huawei, HP, Lenovo, Dell, MSI и Asus в меню старого сайта пустые (0 моделей): либо заполнить, либо не показывать.

## 5. Этап 4: модели внутреннего учёта (добавятся позже)
Не входят в текущую схему, чтобы не усложнять запуск. Добавляются отдельной миграцией и связываются с уже существующими `DeviceModel`, `Lead` и `InventoryItem`:

| Модель | Назначение | Ключевые поля |
|---|---|---|
| `Customer` | карточка клиента | имя, телефон (уникальный), email, согласия |
| `Appointment` | запись на время | модель, работы, `startsAt`, длительность, статус, ссылка на тикет |
| `RepairTicket` | ремонт | номер `R-…`, `publicToken` (ссылка статуса), модель, IMEI, канал (салон / запись / почта), статус (`RECEIVED → DIAGNOSING → AWAITING_APPROVAL → IN_REPAIR → READY → COMPLETED` …), состояние при приёме, фото, подпись, код разблокировки (шифрованный), мастер, срок, гарантия до |
| `TicketLine` / `TicketEvent` | работы с ценой и себестоимостью; история статусов с публичной и внутренней заметкой | |
| `BuybackRequest` | скупка | номер `S-…`, ответы, финальная цена, договор PDF, паспортные данные (AES-256-GCM, доступ по ролям, журнал просмотров), выплата, связь с созданным `InventoryItem` |
| `Customer` ↔ `Order` | история покупок | |

Черновик этих моделей (для PostgreSQL) остался в истории git: `git show abf218c:docs/spec/schema.prisma`. При переносе на MySQL массивы заменяются на Json так же, как в текущей схеме.
