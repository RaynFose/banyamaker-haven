# 02. Модель данных

Полная схема: [schema.prisma](schema.prisma) (проверена `prisma validate`).

## 1. Связи (упрощённо)
```
Brand 1─* DeviceModel ─┬─* RepairPrice *─1 RepairType
                       ├─* InventoryItem ─* ItemPhoto, ItemEvent
                       ├─* BuybackBasePrice
                       ├─* RepairTicket ─* TicketLine, TicketEvent
                       ├─* BuybackRequest ──1 InventoryItem (купленный → в продажу)
                       └─* StockAlert

Customer 1─* Order ─* OrderLine ─1 InventoryItem
              │    ─* Payment, Shipment, OrderEvent
              │    ─1 BuybackRequest (trade-in зачёт)
         1─* RepairTicket ─1 Appointment
         1─* BuybackRequest

User (персонал) ─* RepairTicket (мастер), AuditLog
Page, BlogPost, Faq, Redirect, ReviewCache, Setting, NotificationLog
```

## 2. Главные идеи
1. **DeviceModel — общий справочник** для ремонта, продажи, скупки и подписок. iPhone 13 Pro заводится один раз.
2. **InventoryItem — конкретный экземпляр**, а не «товар с остатком». Каждый б/у телефон уникален (свой класс, батарея, фото, IMEI), поэтому остатков нет: экземпляр либо в продаже, либо нет.
3. **Деньги хранятся в центах (Int).** НДС считается при выставлении счёта по `vatScheme`.
4. **Переводимые поля — Json `{lt, ru?, en?}`** с одной zod-схемой `LocalizedText`. Для сайта такого размера это проще отдельных таблиц переводов.
5. **История через события** (`ItemEvent`, `OrderEvent`, `TicketEvent`): кто, когда и что поменял. Из `TicketEvent.publicNote` строится лента на странице статуса.
6. **Номера документов:** `U-2026-00042` (заказ), `R-2026-00123` (ремонт), `S-2026-00017` (скупка), `MP-000142` (SKU). Генерируются Postgres-последовательностями по году.
7. **Персональные данные:** IMEI, код разблокировки, паспорт продавца и IBAN шифруются (см. 01 §6). Код разблокировки стирается автоматически после выдачи.

## 3. Жизненные циклы

### InventoryItem
```
DRAFT ──(фото + цена + проверка)──► LISTED ──(заказ/бронь)──► RESERVED ──(оплата/выдача)──► SOLD
  ▲                                   ▲                          │
  │                                   └──(истекла бронь/отмена)──┘
  └──(после проверки)── RETURNED ◄──(возврат 14 дней)── SOLD
DRAFT/LISTED ──► ARCHIVED (на запчасти / списан)
```
Переход в `LISTED` возможен, только если есть ≥ 3 фото, цена, класс (для б/у), батарея (для телефонов) и отметка «IMEI проверен».

### Order
```
PENDING_PAYMENT ──(webhook paid)──► PAID ──► PROCESSING ──► SHIPPED ──► COMPLETED
       │                                         └──► READY_FOR_PICKUP ──► COMPLETED
       └──(30 мин без оплаты)──► CANCELLED (товар → LISTED)
RESERVED (бронь без оплаты, 24/48 ч) ──► COMPLETED (оплата в салоне) | CANCELLED
COMPLETED ──► REFUNDED / PARTIALLY_REFUNDED (возврат)
```

### RepairTicket
```
NEW ─► AWAITING_DEVICE ─► RECEIVED ─► DIAGNOSING ─► AWAITING_APPROVAL ─► APPROVED ─► (WAITING_PARTS) ─► IN_REPAIR ─► QUALITY_CHECK ─► READY ─► COMPLETED
 walk-in сразу в RECEIVED          │                 └─► DECLINED ─► READY (выдача без ремонта)
                                   └─► CANNOT_REPAIR ─► READY
Если цена известна заранее (замена батареи по прайсу) — DIAGNOSING → APPROVED без согласования.
```

### BuybackRequest
```
NEW ─► CONTACTED ─► AWAITING_DEVICE ─► INSPECTING ─► OFFER_SENT ─► ACCEPTED ─► PAID ─► (создаётся InventoryItem DRAFT)
                                                          └─► REJECTED ─► RETURNED
Trade-in: PAID не выплачивается деньгами, а зачитывается в Order.tradeInCents.
```

## 4. Импорт с текущего сайта (seed)
| Источник | Куда | Скрипт |
|---|---|---|
| `migration/repair-prices.json` → `repair_types` | `RepairType` (20 типов, названия исправлены: «Ausinių», «Drėgmės», «Įjungimo») | `prisma/seed/repair-types.ts` |
| `migration/repair-prices.json` → `devices` | `Brand` (Apple, Samsung, Google), `DeviceModel` (99), `RepairPrice` (1474) | `prisma/seed/devices.ts` |
| `screen_original`, `housing` | `quality = ORIGINAL`; `back_glass` — `PREMIUM`; остальные — `NONE`/`STANDARD` по смыслу | там же |
| `water_damage` | `isFromPrice = true` («nuo 30 €») | там же |
| `migration/redirects.csv` | `Redirect` | `prisma/seed/redirects.ts` |
| Тексты страниц | вручную: переписываем, а не копируем (см. 09) | — |

Чего не хватает в справочнике (добавить при запуске): iPhone 17 / 17 Air / 17 Pro / 17 Pro Max, Galaxy S25 / S25+ / S25 Ultra / S25 FE / S25 Edge, A16 / A26 / A36 / A56, Galaxy Z Fold/Flip, Xiaomi / Redmi, Google Pixel. Сейчас в меню старого сайта есть категории Xiaomi, Huawei, HP, Lenovo, Dell, MSI, Asus, но **в них 0 моделей**.
