# Order Pizza — Tài liệu thiết kế dự án (Storefront + Admin Dashboard)

> Tài liệu định nghĩa ý tưởng, phạm vi, kiến trúc và mô hình nghiệp vụ cho dự án đặt pizza online. FE-first với mock API, focus vào **business logic** và **Frontend**.

---

## Mục lục

1. [Tổng quan & Mục tiêu](#1--tổng-quan--mục-tiêu)
2. [Quyết định công nghệ](#2--quyết-định-công-nghệ)
3. [Kiến trúc tổng thể](#3--kiến-trúc-tổng-thể)
4. [Cấu trúc thư mục](#4--cấu-trúc-thư-mục)
5. [Mô hình nghiệp vụ (Domain Model)](#5--mô-hình-nghiệp-vụ-domain-model)
6. [Pricing Engine — logic tính giá](#6--pricing-engine--logic-tính-giá)
7. [Order Lifecycle — máy trạng thái đơn hàng](#7--order-lifecycle--máy-trạng-thái-đơn-hàng)
8. [Mock API & Data Contract](#8--mock-api--data-contract)
9. [Storefront (khách hàng)](#9--storefront-khách-hàng)
10. [Admin Dashboard (vận hành)](#10--admin-dashboard-vận-hành)
11. [Phân quyền (RBAC)](#11--phân-quyền-rbac)
12. [Lộ trình triển khai](#12--lộ-trình-triển-khai)
13. [Verification & Testing](#13--verification--testing)
14. [Roadmap tích hợp API thật](#14--roadmap-tích-hợp-api-thật)

---

## 1. Tổng quan & Mục tiêu

Dự án greenfield xây dựng **sản phẩm đặt pizza production-ready**, gồm 2 phần:

- **Storefront**: giao diện khách hàng đặt món (3 kênh: giao tận nơi, tự đến lấy, ăn tại quán).
- **Admin Dashboard**: hệ thống vận hành đầy đủ nghiệp vụ (quản lý đơn, menu, khuyến mãi, kho, chi nhánh, nhân viên, báo cáo).

**Nguyên tắc thiết kế:**

- **FE-first**: làm Frontend trước với mock API. Data shape/contract định nghĩa rõ → khi có API thật chỉ cần thay fetcher, UI không đổi.
- **Focus nghiệp vụ**: logic cốt lõi (tính giá, vòng đời đơn hàng, tồn kho, khuyến mãi) được tách thành **pure module** độc lập, dễ test và tái dùng cho BE sau này.
- **Production-ready**: đa chi nhánh, phân quyền RBAC, kiến trúc mở rộng, i18n (vi/en).

**Mô hình đặt hàng hỗ trợ:** Delivery (cốt lõi), Pickup, Dine-in.

**Thanh toán:** Đa phương thức — COD, ví điện tử (Momo), thẻ (mock).

---

## 2. Quyết định công nghệ

| Layer | Công nghệ | Lý do |
|---|---|---|
| Framework | **React 18 + Vite + TypeScript** | Build nhanh, type-safe, theo yêu cầu |
| Routing | React Router v6 (data routers) | Tách rõ `/` (storefront) và `/admin/*` |
| Server state | **TanStack Query (React Query)** | Cache, retry, loading/error state; dùng được với mock MSW |
| Client state | **Zustand** | Nhẹ, đơn giản (cart, auth, UI) |
| Forms | React Hook Form + **Zod** | Zod schema vừa là **data contract** vừa validate |
| Styling | Tailwind CSS + **shadcn/ui** (Radix) | Accessible, dễ custom, production-ready |
| Charts | Recharts | Dashboard analytics |
| Mock API | **MSW (Mock Service Worker)** + localStorage | Giả lập HTTP thật + persist trạng thái |
| i18n | react-i18next (vi/en) | Thị trường VN |
| Testing | Vitest + React Testing Library + Playwright | Unit (pricing/state machine) + e2e |

---

## 3. Kiến trúc tổng thể

```
┌──────────────────────────────────────────────────────────┐
│                        UI Layer                           │
│   features/storefront/*   ·   features/admin/*           │
│   (chỉ dùng hooks + components, không biết nguồn data)    │
└───────────────▲──────────────────────────────▲───────────┘
                │ useQuery / useMutation        │ Zustand (cart, auth, ui)
┌───────────────┴──────────────────────────────┴───────────┐
│              lib/api/  (typed client + endpoints)         │  ← SWAP API THẬT Ở ĐÂY
└───────────────▲──────────────────────────────────────────┘
                │ fetch('/api/...')
┌───────────────┴──────────────────────────────────────────┐
│        MSW (Mock Service Worker)  ·  localStorage DB      │  ← BỎ KHI CÓ API THẬT
└──────────────────────────────────────────────────────────┘

Pure business logic (tách riêng, tái dùng cho BE):
  lib/pricing/        ·   lib/orders/state-machine.ts
```

**Nguyên tắc:** UI → hooks (React Query) → `lib/api` → MSW. Khi cắm API thật, **chỉ đổi `lib/api`** (base URL, bỏ MSW). Types, Zod, UI, pricing engine giữ nguyên.

---

## 4. Cấu trúc thư mục

```
pizza-order/
├── src/
│   ├── app/                      # app shell, routing, providers
│   │   ├── routes.tsx            # / (storefront), /admin/* (dashboard)
│   │   └── providers.tsx         # ReactQuery, Theme, i18n, MSW bootstrap
│   ├── features/                 # module theo domain
│   │   ├── storefront/
│   │   │   ├── menu/
│   │   │   ├── cart/
│   │   │   ├── checkout/         # 3 kênh + payment
│   │   │   ├── order-tracking/
│   │   │   └── account/
│   │   └── admin/
│   │       ├── dashboard/        # KPI tổng quan
│   │       ├── orders/           # order board (Kanban theo trạng thái)
│   │       ├── menu-management/
│   │       ├── promotions/
│   │       ├── customers/
│   │       ├── branches/
│   │       ├── inventory/
│   │       ├── staff/            # RBAC
│   │       ├── reports/
│   │       └── settings/
│   ├── components/
│   │   ├── ui/                   # shadcn primitives
│   │   ├── layout/               # AdminLayout, StorefrontLayout
│   │   └── data-table/           # bảng tái dùng cho admin
│   ├── lib/
│   │   ├── api/                  # typed client + endpoints (mock now)
│   │   ├── pricing/              # 🔑 pricing engine (pure logic)
│   │   ├── orders/               # 🔑 order state machine
│   │   ├── mock/                 # MSW
│   │   │   ├── handlers/         # REST handlers theo resource
│   │   │   ├── db.ts             # seed + localStorage persistence
│   │   │   └── server.ts
│   │   ├── validation/           # Zod schemas (= data contract)
│   │   └── utils/
│   ├── types/                    # domain types
│   ├── stores/                   # zustand (cart, auth, ui)
│   ├── hooks/
│   └── main.tsx
└── package.json
```

---

## 5. Mô hình nghiệp vụ (Domain Model)

### Entities chính

| Entity | Vai trò | Trường nổi bật |
|---|---|---|
| **Branch** (Chi nhánh) | Đa chi nhánh | address, geo, openingHours, deliveryZones, taxRate |
| **Category** | Nhóm món | name, sortOrder |
| **Product** | Sản phẩm | name, description, image, categoryId, tags[] |
| **ProductVariant** | Biến thể | size (S/M/L/XL), crustType, price |
| **Topping** | Đồ thêm | name, priceBySize |
| **Combo** | Gói bundle | items[], bundlePrice (so với tổng giá gốc) |
| **Customer** | Khách | profile, phone, loyaltyPoints, tier |
| **Address** | Địa chỉ giao | street, ward, district, city, lat/lng |
| **Order** | Đơn hàng | channel, status, lines[], totals, payment, fulfilment |
| **OrderLine** | Line | variantId, crust, toppings[], qty, unitPrice |
| **Promotion** | Khuyến mãi | type, value, conditions, schedule, usageLimit |
| **Inventory** | Tồn kho | branchId, productId/ingredientId, stock, threshold |
| **Staff** | Nhân viên | name, role, branchId |
| **Table** | Bàn (dine-in) | branchId, number, seats, status |
| **Loyalty** | Tích điểm | points, tier, earnRate, redeemRate |

### Sơ đồ quan hệ (rút gọn)

```
Branch ──< Inventory
  │
  └── deliveryZones ──> Address (Customer)

Category ──< Product ──< ProductVariant
                         Product ──< Topping (n-n)
                         Product ──< Combo >── Product (sides/drinks)

Customer ──< Address
Customer ──< Order ──< OrderLine >── ProductVariant
                  │            └──< Topping
                  ├── Payment
                  ├── Promotion (n-n, applied)
                  └── Fulfilment (Delivery | Pickup | DineIn)
```

---

## 6. Pricing Engine — logic tính giá

Module **pure function** (`lib/pricing/`), input → output xác định, không side-effect. Dễ unit test, tái dùng cho BE.

**Input:**
```ts
{
  lines: OrderLine[];              // variant + toppings + qty
  channel: 'delivery' | 'pickup' | 'dine-in';
  fulfilment: DeliveryInfo | PickupInfo | DineInInfo;
  appliedPromotions: Promotion[];
  branch: Branch;                  // taxRate, deliveryZones
  loyaltyRedeem?: { points: number };
}
```

**Output (breakdown):**
```ts
{
  linesSubtotal: number;     // 1. tổng giá line (base + topping×size × qty)
  comboDiscount: number;     // 2. giảm giá bundle
  orderDiscount: number;     // 3. voucher (%/fixed, có cap min/max)
  deliveryFee: number;       // 4. phí ship theo zone + ngưỡng miễn phí
  taxableBase: number;
  tax: number;               // 5. VAT (8%/10% theo branch)
  loyaltyDiscount: number;   // 6. đổi điểm trừ tiền
  grandTotal: number;
  pointsToEarn: number;      // điểm tích lũy
}
```

**Thứ tự tính:** line subtotal → combo discount → order discount → delivery fee → tax (sau giảm giá) → loyalty discount → grand total.

**Quy tắc nghiệp vụ quan trọng:**
- Giá topping phụ thuộc **size** (topping pizza L đắt hơn S).
- Voucher có `minOrder` (đơn tối thiểu), `maxDiscount` (cap), `applicableChannels`, `applicableBranches`, `validFrom/to`, `usageLimit`/`usedCount`.
- Phí ship: theo zone/khoảng cách; **miễn phí** khi đơn ≥ ngưỡng `freeShipThreshold` của branch.
- Tax tính trên base sau giảm giá (không tính trên phí ship, trừ khi luật VN yêu cầu).

---

## 7. Order Lifecycle — máy trạng thái đơn hàng

Vòng đời **khác theo kênh**, định nghĩa trong `lib/orders/state-machine.ts`.

```
DELIVERY :  created → confirmed → preparing → ready
            → assigned_driver → out_for_delivery → delivered → completed

PICKUP   :  created → confirmed → preparing → ready_for_pickup
            → picked_up → completed

DINE-IN  :  created(table) → confirmed → preparing → served → completed
```

- Mọi kênh có thể **cancel** (hủy) ở các điểm cho phép, kèm lý do + policy hoàn tiền theo giai đoạn.
- **Refund** chỉ manager mới được thực hiện (xem [RBAC](#11--phân-quyền-rbac)).
- State machine guard: chỉ cho phép transition hợp lệ, throw nếu sai.

```ts
// Ví dụ API
canTransition(order, 'preparing', 'ready')         // → true
nextStatuses(order)                                  // → ['ready', 'cancelled']
transition(order, 'ready', { actor, reason })       // → order mới hoặc throw
```

---

## 8. Mock API & Data Contract

### Data contract = Types + Zod

`types/*.ts` + `lib/validation/*.ts` (Zod) là **hợp đồng của API tương lai**. MSW bắt buộc trả data đúng schema.

### Seed data phong phú (`lib/mock/db.ts`)

Để dashboard có dữ liệu thực tế:

- ≥ **3 chi nhánh** (HN, HCM, ĐN) với zone giao hàng khác nhau
- **~30 sản phẩm** (pizza, side, drink, dessert) + topping + combo
- **~10 voucher** đủ loại (% , fixed, free ship, BOGO, theo ngưỡng)
- **vài chục đơn** ở các trạng thái/kênh khác nhau
- khách hàng, nhân viên, bàn, inventory

### localStorage persistence

- Mọi thao tác (tạo/sửa đơn, menu, voucher) ghi vào localStorage → tồn tại qua reload.
- Có nút "reset seed" để khôi phục dữ liệu mẫu.

### REST handlers (chu CRUD + filter)

```
GET    /api/products?category=&search=&page=&sort=
GET    /api/products/:id
POST   /api/orders              # tạo đơn (validate + chạy pricing engine)
GET    /api/orders?status=&channel=&branch=&from=&to=
PATCH  /api/orders/:id          # chuyển trạng thái (qua state machine)
POST   /api/orders/:id/cancel
POST   /api/promotions/validate # kiểm tra voucher hợp lệ + tính giảm
GET/PATCH /api/branches, /api/customers, /api/inventory ...
POST   /api/auth/login          # mock auth (trả role)
```

> Khi có API thật: đổi `baseURL` trong `lib/api`, bỏ khởi động MSW. Code gọi không đổi.

---

## 9. Storefront (khách hàng)

1. **Menu** — theo danh mục, lọc (vegetarian, spicy, new), tìm kiếm, chọn chi nhánh, toggle available.
2. **Product detail** — chọn size/crust, toppings (multi), qty, xem **giá realtime** (pricing engine), thêm vào giỏ.
3. **Cart** — sửa/xóa line, chọn kênh (delivery/pickup/dine-in), áp voucher, xem breakdown giá đầy đủ.
4. **Checkout**
   - **Delivery**: chọn/tạo địa chỉ, phí ship theo zone, chọn khung giờ giao.
   - **Pickup**: chọn chi nhánh + khung giờ.
   - **Dine-in**: quét/chọn bàn.
   - **Payment**: COD / ví (Momo mock) / thẻ (mock).
5. **Order tracking** — timeline theo state machine, cập nhật (mock realtime).
6. **Account** — lịch sử đơn, điểm tích lũy, địa chỉ đã lưu.

---

## 10. Admin Dashboard (vận hành)

| # | Module | Nghiệp vụ chính |
|---|---|---|
| 1 | **Dashboard tổng quan** | KPI (doanh thu hôm nay, số đơn, AOV, đơn active), biểu đồ doanh thu theo thời gian/kênh, top sản phẩm, đơn gần đây, cảnh báo tồn kho thấp |
| 2 | **Quản lý đơn (Order board)** | Kanban theo trạng thái, filter (kênh/chi nhánh/thanh toán/ngày), bulk action, **chuyển trạng thái** theo state machine, hủy/hoàn tiền |
| 3 | **Quản lý menu** | CRUD sản phẩm/biến thể/topping/combo/danh mục, toggle available, gắn chi nhánh |
| 4 | **Khuyến mãi** | CRUD voucher, loại giảm, lịch trình, giới hạn lượt, điều kiện áp dụng |
| 5 | **Khách hàng** | profile, phân khúc, lịch sử, điểm/hạng, blacklist |
| 6 | **Chi nhánh** | thiết lập, giờ mở cửa, vùng giao hàng, giá riêng |
| 7 | **Tồn kho** | stock per branch, cảnh báo, ánh xạ nguyên liệu ↔ sản phẩm |
| 8 | **Nhân viên & phân quyền** | RBAC, ca làm, giới hạn quyền theo state machine |
| 9 | **Báo cáo** | doanh thu, hiệu suất sản phẩm, theo kênh/chi nhánh/thời gian, xuất CSV |
| 10 | **Cài đặt** | thuế, payment methods, branding, i18n |

---

## 11. Phân quyền (RBAC)

| Role | Quyền | Giới hạn |
|---|---|---|
| **manager** | Toàn quyền admin | — |
| **cashier** | Đơn, khách, khuyến mãi | Không xóa/sửa cấu hình chi nhánh, không hoàn tiền |
| **kitchen** | Xem đơn + chuyển trạng thái chuẩn bị | Không truy cập báo cáo/tài chính |
| **driver** | Xem đơn giao được phân + cập nhật giao hàng | Chỉ đơn delivery được gán |

- Guard ở **routing** (chặn route) + **button/action** (ẩn hoặc disable).
- State machine cũng check role khi transition (vd: refund chỉ manager).

---

## 12. Lộ trình triển khai

| Phase | Nội dung | Trọng tâm |
|---|---|---|
| **P0** | Scaffold: Vite+TS, Tailwind+shadcn, React Router, React Query, Zustand, MSW, layout 2 vùng | Nền tảng |
| **P1** | Domain types + Zod schemas + seed data + MSW handlers + localStorage | Data contract |
| **P2** | **Pricing engine + order state machine** + unit test đầy đủ | 🔑 Nghiệp vụ cốt lõi |
| **P3** | Storefront: menu → cart → checkout (3 kênh) → payment → tracking | Trải nghiệm khách |
| **P4** | Admin core: dashboard + order board (thao tác trạng thái) | Vận hành chính |
| **P5** | Admin quản lý: menu / promotions / customers / branches / inventory CRUD | Đầy đủ nghiệp vụ |
| **P6** | RBAC + báo cáo/analytics + xuất CSV | Phân quyền & insight |
| **P7** | Polish: i18n, responsive, a11y, loading/empty/error, e2e Playwright | Chất lượng |

---

## 13. Verification & Testing

1. `npm run dev` → storefront: thêm pizza (size + topping), kiểm tra **giá đúng** theo pricing engine.
2. Checkout 3 kênh, áp voucher, chọn payment mock → đơn tạo + **ghi localStorage**, reload vẫn còn.
3. `/admin` → đơn mới trên **order board**, chuyển trạng thái hợp lệ, KPI dashboard cập nhật.
4. CRUD menu/promotion/inventory → phản ánh lên storefront.
5. Đăng nhập các role → **RBAC** chặn đúng action (cashier không hoàn tiền).
6. `npm run test` → unit test pricing + state machine pass.
7. `npm run e2e` → Playwright flow đặt-đơn-đến-hoàn-thành.

---

## 14. Roadmap tích hợp API thật

| Bước | Việc | Ảnh hưởng |
|---|---|---|
| 1 | BE triển khai đúng REST contract đã định nghĩa (types + Zod) | — |
| 2 | Đổi `baseURL` trong `lib/api`, bỏ khởi động MSW | Chỉ 1 file |
| 3 | (Tùy chọn) Tách `lib/pricing` + `lib/orders/state-machine` thành package dùng chung FE/BE | Tránh lệch giá/trạng thái 2 bên |
| 4 | Thêm auth thật (JWT/session), loại bỏ mock auth | `stores/auth` + interceptor |

> Toàn bộ UI, types, Zod, pricing engine, state machine **giữ nguyên** — đây là lợi ích của kiến trúc FE-first + contract-driven.
