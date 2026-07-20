# Hướng dẫn thực hiện A–Z — Order Pizza

> Thứ tự làm **từ đầu đến cuối**, mỗi phase có mục tiêu + bước cụ thể + lệnh + checklist. Tra cứu quy tắc code ở [CODING_CONVENTIONS.md](./CODING_CONVENTIONS.md).
>
 Nguyên tắc: **vertical slice** — làm xong 1 flow nhỏ (chạy được end-to-end) rồi mở rộng, không làm hết 1 tầng rồi sang tầng khác.

---

## Trước khi bắt đầu

Đọc theo thứ tự:
1. [PROJECT_DESIGN.md](./PROJECT_DESIGN.md) — kiến trúc, domain model, pricing/state-machine.
2. [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) — tokens (paste-ready) + component dùng chung.
3. [CODING_CONVENTIONS.md](./CODING_CONVENTIONS.md) — quy tắc code.
4. `wireframes/index.html` — mở xem layout từng màn (`cd wireframes && python3 -m http.server 8765`).

> Tailwind **v3** (khớp config DESIGN_SYSTEM §4). Nếu dùng v4, đổi setup theo guide Tailwind v4 — tokens/component giữ nguyên.

---

## Phase 0 — Scaffold (dự án trống → chạy được)

**Mục tiêu**: Vite app chạy + Tailwind + alias + tooling sẵn sàng.

```bash
# 1. tạo project — Vite 8 template đã kèm React 19 + TypeScript 7 + oxlint
npm create vite@latest . -- --template react-ts
npm install

# 2. Tailwind v4 (Vite plugin — KHÔNG cần tailwind.config.js / postcss.config.js)
npm install tailwindcss @tailwindcss/vite

# 3. runtime deps
npm install react-router-dom @tanstack/react-query zustand react-hook-form zod @hookform/resolvers clsx tailwind-merge class-variance-authority tw-animate-css lucide-react recharts date-fns sonner react-i18next i18next msw

# 4. test deps (Vite đã có oxlint sẵn)
npm install -D prettier vitest @testing-library/react @testing-library/jest-dom jsdom @playwright/test
```

Khởi tạo shadcn v4 (Component library: **Radix UI** · Preset: **chọn preset có sẵn, vd Nova** — **KHÔNG chọn Custom** vì Custom bắt build theme trên web · Framework: **Vite** · RSC: **No**):
```bash
npx shadcn@latest init
npx shadcn@latest add button card badge input textarea label select checkbox radio-group switch slider dialog sheet alert-dialog dropdown-menu popover tooltip tabs accordion avatar separator skeleton scroll-area table pagination form sonner command calendar
```

**Checklist P0**
- [x] `npm run dev` chạy, hiện trang mẫu.
- [x] `npm run build` không lỗi TS.
- [x] `npm run lint` (oxlint) chạy được.

---

## Phase 1 — Config & design tokens

**Mục tiêu**: token màu + dark mode + alias + tooling config xong (Tailwind **v4**, CSS-first).

1. `vite.config.ts`: thêm plugin `tailwindcss()` từ `@tailwindcss/vite` + alias `@` → `src`.
2. `tsconfig.app.json`: bật `strict`, `noUncheckedIndexedAccess`, `paths "@/*"` (**không** dùng `baseUrl` — TS7 deprecated). Xem Conventions §4.
3. `.oxlintrc.json`: plugins `react/typescript/import`; warn `no-explicit-any`, `no-console`, `no-debugger`.
4. `.prettierrc`: `singleQuote`, `printWidth: 100`, `semi: true`.
5. **Token v4**: sau khi `shadcn init` sinh `src/index.css` (đã có `@import "tailwindcss"; @custom-variant dark; :root{} .dark{} @theme inline{}`), thay giá trị `:root`/`.dark`/`@theme inline` bằng **Indigo tokens bản v4** (DESIGN_SYSTEM §3 — bản v4). v4 **không có `tailwind.config.ts`**, token định nghĩa ngay trong CSS qua `@theme inline`.
6. `src/lib/utils.ts`: `cn()` (shadcn đã tạo) + thêm `formatCurrency()`, `formatDate()`.

```ts
// vite.config.ts — ESM, dùng fileURLToPath cho alias (không __dirname)
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
})
```

**Checklist P1**
- [ ] `bg-primary`, `bg-channel-delivery` render đúng màu (test 1 div).
- [ ] Toggle class `dark` trên `<html>` → nền đổi.
- [ ] `import { cn } from '@/lib/utils'` hoạt động.

---

## Phase 2 — Domain types + Zod + mock data

**Mục tiêu**: data contract + mock API chạy, UI chưa cần.

1. `src/types/`: viết entity (xem PROJECT_DESIGN §5) — `order.ts`, `product.ts`, `customer.ts`, `branch.ts`, `promotion.ts`, `payment.ts`, `common.ts`.
2. `src/validation/`: Zod schema tương ứng + `z.infer` type (nếu schema là nguồn sự thật thì có thể bỏ types tay).
3. `src/lib/mock/db.ts`: seed dataset phong phú (xem PROJECT_DESIGN §4 — ≥3 chi nhánh, ~30 sản phẩm, ~10 voucher, vài chục đơn đa trạng thái). Đọc/ghi `localStorage`, có `resetSeed()`.
4. `src/lib/mock/handlers/`: REST handler theo resource (`orders.ts`, `products.ts`…). Dùng `http.get/post/patch` của MSW.
5. `src/lib/mock/server.ts`: khởi worker (browser) + `setupServer` (node test).
6. `src/main.tsx`: enable MSW trong dev:
   ```ts
   if (import.meta.env.DEV) {
     const { worker } = await import('@/lib/mock/browser');
     await worker.start({ onUnhandledRequest: 'warn' });
   }
   ```

**Checklist P2**
- [ ] Tab Network thấy MSW trả `/api/products`, `/api/orders`.
- [ ] Tạo/sửa (POST/PATCH) qua MSW → lưu lại trong `localStorage`, reload còn.
- [ ] Response khớp Zod schema (parse thử 1 response).

---

## Phase 3 — Business logic (pure, test kỹ) 🔑

**Mục tiêu**: pricing engine + order state machine chạy + có unit test. **Làm trước khi UI** vì UI phụ thuộc nó.

1. `src/lib/pricing/`:
   - `types.ts` — input/output của engine.
   - `computeOrder.ts` — hàm chính: line subtotal → combo → voucher → delivery fee → VAT → loyalty → grand total (xem PROJECT_DESIGN §6).
   - `voucher.ts` — kiểm tra hợp lệ + tính giảm (min/max cap, kênh, chi nhánh).
   - `index.ts` — re-export.
2. `src/lib/orders/state-machine.ts`:
   - `canTransition(order, to)`, `nextStatuses(order)`, `transition(order, to, ctx)` (xem PROJECT_DESIGN §7). Guard theo kênh.
3. **Unit test (Vitest)**: mỗi nhánh logic 1 case — topping theo size, voucher cap, free ship ngưỡng, VAT, transition hợp lệ/bất hợp lệ, refund.

**Checklist P3**
- [ ] `npm run test -- pricing` pass, coverage > 90%.
- [ ] State machine: chỉ cho phép transition đúng theo kênh; hủy có policy hoàn tiền.

---

## Phase 4 — Shared components + layouts + routing

**Mục tiêu**: nền UI + skeleton 2 vùng (storefront/admin) đi được.

1. `components/shared/`: dựng theo [DESIGN_SYSTEM §8B](./DESIGN_SYSTEM.md) — `DataTable`, `KpiCard`, `StatusBadge`, `ChannelTag`, `Money`, `SegmentedControl`, `QuantityStepper`, `PriceBreakdown`, `OrderStepper`, `FormRow`, `FilterBar`, `PageHeader`, `EmptyState/ErrorState/LoadingState`, `ConfirmDialog`, `MiniBarChart`.
   - `StatusBadge`/`ChannelTag` map theo bảng [DESIGN_SYSTEM §7](./DESIGN_SYSTEM.md).
2. `components/layout/`: `StorefrontLayout` (header + catbar + footer), `AdminLayout` (sidebar + topbar — mô phỏng `admin-shell.js`).
3. `app/providers.tsx`: ReactQueryClientProvider, ThemeProvider (dark mode), I18nProvider, Toaster (sonner).
4. `app/routes.tsx`: 2 nhánh `/` (storefront) và `/admin/*` (admin) dùng React Router lazy.
5. Dummy page mỗi route → vào `/` và `/admin` được.

**Checklist P4**
- [ ] `/admin` hiện sidebar + topbar, active nav đúng.
- [ ] `<StatusBadge status="preparing" />` hiện cam; `<ChannelTag channel="delivery" />` hiện indigo 🛵.
- [ ] Dark mode toggle hoạt động toàn app.

---

## Phase 5 — Storefront (flow khách hàng)

**Thứ tự** (mỗi bước = 1 vertical slice chạy được):

1. **Menu** (`features/storefront/menu`) — query `/api/products`, grid theo category, filter, chọn chi nhánh. Dùng `ProductCard` + `SegmentedControl`.
2. **Product detail + Quick-Add modal** — chọn size/đế/topping, giá **realtime** gọi pricing engine, thêm vào giỏ (Zustand `cartStore`).
3. **Cart** — line items, chọn kênh (segmented), áp voucher (gọi `/api/promotions/validate`), hiện `PriceBreakdown`.
4. **Checkout (3 kênh)** — form RHF + Zod; phần fulfilment đổi theo kênh (discriminated union); payment method; `POST /api/orders` (mock validate + pricing). Thành công → Order Success modal → tracking.
5. **Order tracking** — poll `/api/orders/:id` (React Query `refetchInterval`), `OrderStepper` theo state machine, map/shipper placeholder.
6. **Account** — lịch sử đơn (`/api/orders?customer=`), địa chỉ, loyalty card.

**Checklist P5**
- [ ] Đặt 1 đơn delivery end-to-end → xuất hiện ở `/admin` Order Board.
- [ ] Đổi kênh (delivery/pickup/dine-in) → phí + form đổi đúng.
- [ ] Voucher áp/sai xử lý đúng (toast).

---

## Phase 6 — Admin (vận hành)

**Thứ tự**:

1. **Dashboard** — KPI tiles, biểu đồ (Recharts/`MiniBarChart`), top sản phẩm, đơn gần đây, cảnh báo tồn kho.
2. **Order Board** — Kanban theo trạng thái (state machine), filter (kênh/chi nhánh/payment/ngày), kéo thẻ = `PATCH /api/orders/:id` (transition).
3. **Order detail drawer** — items + breakdown + timeline + action (advance/refund).
4. **Menu management** — `DataTable` + Product Editor modal (biến thể, topping, combo, available toggle).
5. **Promotions** — bảng voucher + Voucher Editor modal (loại/giá trị/cap/điều kiện/lịch).
6. **Customers / Branches / Inventory** — list + detail/edit.
7. **Reports** — filter thời gian/chi nhánh/kênh + biểu đồ + xuất CSV.
8. **Settings** — thuế/phí, toggle payment, i18n, reset seed.

**Checklist P6**
- [ ] Kéo thẻ đơn qua các cột đúng theo state machine; refund chỉ Manager làm được (RBAC).
- [ ] CRUD menu/voucher lưu qua mock, phản ánh storefront.

---

## Phase 7 — Cross-cutting (auth/RBAC, i18n, dark mode polish)

1. **Mock auth**: `authStore` (Zustand) + `POST /api/auth/login` (trả role). Vài user mẫu (manager/cashier/kitchen/driver). Guard route + button theo permission (xem DESIGN_SYSTEM không có — dùng PROJECT_DESIGN §11 RBAC matrix).
2. **i18n**: tạo `locales/vi.json` (mặc định) + `en.json`; bọc `I18nextProvider`; chuyển mọi chuỗi hardcode sang `t()`. Toggle ngôn ngữ ở Settings/header.
3. **Dark mode**: `uiStore` lưu theme, áp class `dark`; nút toggle; nhớ lựa chọn qua localStorage.
4. **Toast**: chuẩn hóa thông báo thành công/lỗi qua `sonner` ở mọi mutation.

**Checklist P7**
- [ ] Đăng nhập 4 role → quyền khác nhau (cashier không hoàn tiền, kitchen chỉ bếp).
- [ ] Chuyển EN ↔ VI toàn app không sót chuỗi.
- [ ] Dark/light không có vùng vỡ màu.

---

## Phase 8 — Polish & test

1. **Async states**: mọi query có `LoadingState`/`EmptyState`/`ErrorState` + retry.
2. **Responsive**: test mobile/tablet (storefront mobile-first, admin ≥ tablet).
3. **A11y**: keyboard tab qua mọi flow, focus trap dialog, contrast AA.
4. **E2E (Playwright)**: kịch bản đặt đơn delivery từ menu → checkout → thấy ở admin → advance → completed.
5. **Performance**: lazy route, list lớn virtualize, React Query cache hợp lý.
6. **README**: cách chạy (`npm i`, `npm run dev`), cấu trúc, cách bật/tắt MSW, cách cắm API thật.

**Checklist P8**
- [ ] `npm run test` (unit) + `npm run e2e` pass.
- [ ] Lighthouse a11y ≥ 95 trên 2-3 màn chính.
- [ ] Không còn `console.log` / `any` / hex color (grep kiểm tra).

---

## Lệnh thường dùng

```bash
npm run dev          # chạy dev (MSW bật)
npm run build        # build production (tsc -b && vite build)
npm run lint         # oxlint (Vite 8 đã có sẵn)
```

> Các script `test` (vitest), `e2e` (playwright), `format` (prettier) **chưa có** trong `package.json` — thêm vào khi đến Phase 3 (test) / Phase 8 (e2e).

---

## Khi cắm API thật (sau này)

1. BE triển khai đúng contract (types + Zod).
2. Đổi `baseURL` trong `lib/api`, tắt MSW (`main.tsx`).
3. (Tuỳ chọn) tách `lib/pricing` + `lib/orders` thành package dùng chung FE/BE.
4. Thay mock auth bằng JWT/session + interceptor.

> UI, types, Zod, pricing engine, state machine **giữ nguyên** — đây là kết quả của kiến trúc contract-driven.

---

## Lộ trình tóm tắt

| Phase | Kết quả | Thời gian ước lượng |
|---|---|---|
| 0 Scaffold | app chạy | 0.5 ngày |
| 1 Tokens/config | design system chạy | 0.5 ngày |
| 2 Types + mock | API giả hoạt động | 1.5 ngày |
| 3 Business logic | pricing + state machine + test | 1.5 ngày |
| 4 Shared + layout | nền UI + routing | 1.5 ngày |
| 5 Storefront | flow khách end-to-end | 3–4 ngày |
| 6 Admin | vận hành đầy đủ | 4–5 ngày |
| 7 Cross-cutting | RBAC + i18n + dark | 2 ngày |
| 8 Polish | test + a11y + e2e | 2 ngày |

Làm đúng thứ tự Phase 0 → 8; trong mỗi phase cứ **checklist đầy đủ** mới sang phase sau.
