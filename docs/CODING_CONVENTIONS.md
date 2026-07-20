# Coding Conventions — Order Pizza

> Bộ quy tắc khi viết code. Tra cứu trong quá trình code. Thứ tự thực hiện xem ở [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md).
>
 Stack: **React + Vite + TypeScript** · Tailwind v3 + shadcn/ui · React Query · Zustand · RHF + Zod · MSW.

---

## Mục lục

1. [Nguyên tắc chung](#1--nguyên-tắc-chung)
2. [Cấu trúc & đặt file](#2--cấu-trúc--đặt-file)
3. [Naming conventions](#3--naming-conventions)
4. [TypeScript](#4--typescript)
5. [React patterns](#5--react-patterns)
6. [State management](#6--state-management)
7. [Styling (Tailwind)](#7--styling-tailwind)
8. [API & mock layer](#8--api--mock-layer)
9. [Forms (RHF + Zod)](#9--forms-rhf--zod)
10. [Shared components](#10--shared-components)
11. [Imports & alias](#11--imports--alias)
12. [Testing](#12--testing)
13. [Git & commit](#13--git--commit)
14. [Accessibility · i18n · dark mode](#14--accessibility--i18n--dark-mode)
15. [Anti-patterns (đừng làm)](#15--anti-patterns-đừng-làm)

---

## 1. Nguyên tắc chung

- **Đọc trước khi viết**: tái dùng component/hook/util đã có (xem `DESIGN_SYSTEM.md` §8). Không tự viết thứ đã tồn tại.
- **Pure cho logic nghiệp vụ**: pricing engine + order state machine là hàm thuần (pure), không side-effect, dễ test, tái dùng cho BE.
- **Contract-driven**: types + Zod là hợp đồng API. MSW trả đúng schema → sau này chỉ đổi fetcher.
- **Fail loud**: strict TypeScript, không `any`. Bắt lỗi sớm.
- **Nhỏ + tập trung**: 1 file = 1 trách nhiệm. Component ≤ ~200 dòng; dài hơn → tách sub-component.
- **Đừng tối ưu sớm**: code rõ ràng trước, memoize/optimize khi đo được.

---

## 2. Cấu trúc & đặt file

Khớp [PROJECT_DESIGN.md §4](./PROJECT_DESIGN.md). Feature-based:

```
src/
├── app/                # shell, routing, providers
├── features/
│   ├── storefront/<area>/   # menu, cart, checkout, order-tracking, account
│   │   ├── components/      # component riêng feature
│   │   ├── hooks/           # use<Area>...
│   │   ├── <Area>Page.tsx   # page component
│   │   └── types.ts         # (nếu feature có type riêng)
│   └── admin/<area>/        # dashboard, orders, menu-management, ...
├── components/
│   ├── ui/             # shadcn primitives (generate)
│   ├── shared/         # component dùng chung (DataTable, StatusBadge…)
│   └── layout/         # AdminLayout, StorefrontLayout
├── lib/
│   ├── api/            # typed client + endpoints/resource
│   ├── pricing/        # 🔑 pricing engine (pure)
│   ├── orders/         # 🔑 order state machine (pure)
│   ├── mock/           # MSW handlers + db + server
│   └── utils.ts        # cn(), formatCurrency…
├── validation/         # Zod schemas (= data contract)
├── types/              # domain types (entity)
├── stores/             # zustand (cart, auth, ui)
├── hooks/              # hook dùng chung (useDebounce…)
├── locales/            # vi.json, en.json
└── main.tsx
```

**Quy tắc đặt file**:
- 1 component = 1 file. Tên file = tên component.
- Page luôn kết thúc `Page.tsx` (`OrdersPage.tsx`, `CheckoutPage.tsx`).
- Không tạo barrel `index.ts` trừ folder `shared/`, `ui/` (re-export cho import gọn).

---

## 3. Naming conventions

| Loại | Quy ước | Ví dụ |
|---|---|---|
| Component / Page | PascalCase | `DataTable.tsx`, `OrdersPage.tsx` |
| Hook | camelCase, bắt đầu `use` | `useOrders.ts`, `useCart()` |
| Store (zustand) | camelCase + hậu tố `Store` | `cartStore.ts`, `authStore.ts` |
| Type/Interface | PascalCase | `Order`, `OrderLine`, `OrderStatus` |
| Enum/union | PascalCase, giá trị kebab/snake nhất quán | `type OrderStatus = 'created' \| 'preparing' …` |
| Zod schema | camelCase + `Schema` | `orderSchema`, `productVariantSchema` |
| Hàm util | camelCase, động từ | `formatCurrency`, `computeOrderTotal` |
| Hằng số | UPPER_SNAKE | `MAX_TOPPINGS`, `FREE_SHIP_THRESHOLD` |
| File type domain | kebab hoặc số ít | `types/order.ts` |
| CSS class | qua token Tailwind | `bg-primary`, `text-muted-foreground` |
| Event handler (props) | `on` + CamelCase | `onConfirm`, `onChannelChange` |
| Boolean prop | ý nghĩa tích cực | `isLoading` (không `isNotLoading`) |

---

## 4. TypeScript

**Bật strict** trong `tsconfig.json`:
```jsonc
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  }
}
```

Quy tắc:
- **Không `any`**. Cần "bất kỳ" → `unknown` + type guard, hoặc `Record<string, unknown>`.
- **`interface` cho props & entity** (object shape); **`type` cho union/utility**.
  ```ts
  interface OrderLine { id: string; qty: number; variant: ProductVariant; toppings: Topping[]; }
  type OrderStatus = 'created' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  ```
- **Không `enum`** → dùng **union type** (align với JSON API, tree-shake tốt hơn).
- **Infer type từ Zod** thay vì viết tay khi schema là nguồn sự thật:
  ```ts
  export const orderSchema = z.object({ id: z.string(), total: z.number() });
  export type Order = z.infer<typeof orderSchema>;
  ```
- **Discriminated union** cho dữ liệu phân nhánh (fulfilment theo kênh):
  ```ts
  type Fulfilment =
    | { channel: 'delivery'; address: Address; fee: number }
    | { channel: 'pickup'; branchId: string; slot: string }
    | { channel: 'dine-in'; branchId: string; tableId: string };
  ```
- Export type song hành cùng component: `export interface ButtonProps {…}`.

---

## 5. React patterns

- Chỉ **function component**. Khai báo bằng `function`:
  ```tsx
  export function ProductCard({ product, onAdd }: ProductCardProps) {
    return (…);
  }
  ```
- Props → **`interface`**, đặt ngay trên component, export.
- Hooks: tuân thủ Rules of Hooks; 1 hook = 1 trách nhiệm; tên `use*`.
- **Không fetch trong `useEffect`** → dùng React Query (xem §8).
- **Không tạo object/array mới trong render** nếu truyền vào dependency/hook nặng → đặt ngoài component hoặc `useMemo` khi cần.
- Early return cho guard:
  ```tsx
  if (!order) return <LoadingState />;
  ```
- Key list bằng **id**, không dùng index: `{items.map(i => <Row key={i.id} />)}`.
- Đừng prop-drill quá 2 tầng → context hoặc lift state lên.

---

## 6. State management

**Ranh giới rõ — 3 loại state:**

| Loại | Dùng | Ví dụ |
|---|---|---|
| **Server state** (từ API/mock) | **React Query** | danh sách đơn, menu, khách, báo cáo |
| **Client global** (UI/session) | **Zustand** | giỏ hàng, auth/role, theme, drawer mở, toast |
| **Local** (1 component) | `useState` | mở popover, giá trị input tạm |
| **URL state** (filter, pagination) | `useSearchParams` | filter admin, sort menu |

Quy tắc:
- **Không bao giờ** để dữ liệu API trong Zustand. Zustand chỉ cho state không đến từ server.
- Zustand store tách theo domain (`cartStore`, `authStore`, `uiStore`), không phải 1 store khổng lồ.
- Selector hẹp để tránh re-render thừa: `const items = useCartStore(s => s.items)` (không `const store = useCartStore()`).
- Mutation React Query → **invalidate** query liên quan:
  ```ts
  const qc = useQueryClient();
  const m = useMutation({ mutationFn: api.updateOrder, onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] }) });
  ```

---

## 7. Styling (Tailwind)

- **Chỉ dùng token** (`bg-primary`, `text-muted-foreground`, `border-border`, `bg-channel-delivery`) — KHÔNG hex/`text-[#…]`. Nguồn token ở [DESIGN_SYSTEM.md §3–4](./DESIGN_SYSTEM.md).
- Class có điều kiện → hàm **`cn()`** (`clsx` + `tailwind-merge`):
  ```tsx
  <div className={cn('rounded-lg p-4', isActive && 'bg-primary text-primary-foreground', className)} />
  ```
- Thứ tự class (đề nghị nhất quán): `layout → size → spacing → typography → color → border → state`.
  ```
  className="flex w-full gap-4 px-4 text-sm font-semibold text-foreground bg-card rounded-lg border hover:bg-muted"
  ```
- Badge mềm: nền `${tone}/10` + chữ `${tone}` (`bg-warning/10 text-warning`).
- Component dùng **shadcn** làm gốc, custom qua className/variants (`cva`).
- Mọi màn phải **dark mode** hoạt động (đã có token dark).
- Responsive: mobile-first (`sm:` `md:` `lg:`).

---

## 8. API & mock layer

Kiến trúc: **UI → hook (React Query) → `lib/api` → MSW**.

- Mọi lời gọi data đi qua `lib/api/<resource>.ts`, trả type đã định nghĩa:
  ```ts
  // lib/api/orders.ts
  import type { Order } from '@/types/order';
  export async function getOrders(params: OrderQuery): Promise<Order[]> {
    const res = await fetch(`/api/orders?${toQuery(params)}`);
    if (!res.ok) throw new ApiError(res.status);
    return res.json();
  }
  ```
- Component **chỉ dùng hook**, không gọi `api.*` trực tiếp trong JSX logic:
  ```ts
  // features/admin/orders/hooks/useOrders.ts
  export function useOrders(params: OrderQuery) {
    return useQuery({ queryKey: ['orders', params], queryFn: () => api.getOrders(params) });
  }
  ```
- **Query key** dạng mảng ổn định: `['orders', { status, channel, page }]`.
- Lỗi → React Query `error` + toast (`sonner`), KHÔNG `try/catch` rồi `console.log` rồi trả `null`.
- MSW khởi động trong dev (xem [Guide Phase 2](./IMPLEMENTATION_GUIDE.md)). Khi có API thật → đổi `baseURL` + tắt MSW.
- Validate đầu vào/đầu ra bằng Zod ở biên (response parse) khi dữ liệu quan trọng.

---

## 9. Forms (RHF + Zod)

- Schema ở `validation/<resource>.ts`, infer type:
  ```ts
  export const checkoutSchema = z.object({
    channel: z.enum(['delivery','pickup','dine-in']),
    addressId: z.string().min(1, 'Chọn địa chỉ'),
    payment: z.enum(['cod','momo','card']),
  });
  export type CheckoutValues = z.infer<typeof checkoutSchema>;
  ```
- Dùng `<FormRow>` (label + field + error) cho nhất quán.
- Submit → `useMutation`; disable nút khi `isSubmitting`.
- Thông báo lỗi i18n (`t('errors.required')`).

```tsx
const form = useForm<CheckoutValues>({ resolver: zodResolver(checkoutSchema) });
const onSubmit = form.handleSubmit((values) => mutate(values));
```

---

## 10. Shared components

- Component dùng chung ở `components/shared/`, đúng tên/props ở [DESIGN_SYSTEM.md §8](./DESIGN_SYSTEM.md).
- Nguyên tắc **"lặp ≥ 2 lần → rút thành shared"**.
- Props: dùng composition (`children`) hơn là config khổng lồ. Slot cho phần linh hoạt.
- Truyền `className` xuống mọi shared component (override được).
- Component đặc thù feature → `features/<area>/components/`, KHÔNG nhét vào `shared/`.

---

## 11. Imports & alias

- Alias `@/` → `src/` (config cả `tsconfig` và `vite.config`).
- Thứ tự import (dùng oxlint plugin `import`):
  1. React + thư viện ngoài
  2. `@/lib`, `@/hooks`, `@/components`
  3. `@/types`, `@/validation`
  4. `./` (relative)
  5. style/asset
- Không import vòng (circular) — đánh dấu cần tách module.
- Không import sâu xuyên feature (vd admin import từ `features/storefront/...`) → đưa lên `shared/`.

---

## 12. Testing

| Loại | Công cụ | Phạm vi |
|---|---|---|
| Unit (pure logic) | **Vitest** | pricing engine, state machine, utils — coverage cao |
| Component/integration | Vitest + **RTL** | flow chính (add to cart, checkout, advance order) |
| E2E | **Playwright** | happy path đặt-đơn-đến-hoàn-thành |

Quy tắc:
- Logic nghiệp vụ (pricing, state machine) **phải** có unit test trước khi dùng ở UI.
- Đặt tên test mô tả hành vi: `it('áp voucher 30% và cap 150k')`.
- Mock MSW handler trong test integration (dùng cùng handler).
- Không test implementation detail (không assert state nội bộ).

---

## 13. Git & commit

- **Conventional Commits**:
  ```
  feat(checkout): áp voucher theo kênh + ngưỡng
  fix(pricing): tính VAT sai khi đổi điểm
  refactor(orders): tách state machine ra module riêng
  test(pricing): thêm case topping theo size
  docs: bổ sung coding conventions
  chore(deps): bump react-query
  style: xếp lại class Tailwind
  ```
- Branch: `feat/<topic>`, `fix/<topic>`, `refactor/<topic>` (kebab-case).
- Commit nhỏ, 1 chủ đề. PR < 400 dòng dễ review hơn.
- PR mô tả: what / why / how to test.
- Không commit: `.env`, `node_modules`, file build, screenshot tạm.

---

## 14. Accessibility · i18n · dark mode

**A11y**:
- Dùng semantic HTML (`<button>`, `<nav>`, `<main>`, `<thead>`).
- shadcn/Radix đã xử lý focus trap, ARIA cho dialog/menu — đừng phá.
- Mọi tương tác dùng được bằng keyboard; focus ring luôn hiện (`ring`).
- Contrast ≥ AA; icon có `aria-label` nếu không có text.

**i18n**:
- Mọi chuỗi người dùng thấy → `t('namespace.key')`. Không hardcode tiếng Việt trong component.
- Namespace: `common`, `menu`, `cart`, `checkout`, `orders`, `admin`, `errors`.
- Số tiền/ngày → format qua util (`formatCurrency`, date-fns), không tự concat.

**Dark mode**:
- Toggle qua class `dark` trên `<html>` (Tailwind `darkMode: 'class'`).
- Không hardcode color; token đã có cặp light/dark.

---

## 15. Anti-patterns (đừng làm)

| ❌ Đừng | ✅ Thay vào |
|---|---|
| Để data API trong Zustand | React Query |
| Fetch trong `useEffect` | hook React Query |
| Dùng `any` | `unknown` + guard / type đúng |
| Hex/`text-[#…]}` | token Tailwind |
| Mutate state trực tiếp | trả object mới (immutable) |
| Prop-drill > 2 tầng | context / lift state |
| Component > ~200 dòng | tách sub-component |
| Import xuyên feature | đưa lên `shared/` |
| `key={index}` cho list động | `key={item.id}` |
| Copy-paste logic lặp | rút util/hook/shared |
| `console.log` còn sót | xóa / dùng logger |
| Enum | union type |
| Try/catch rồi nuốt error | để React Query + toast xử lý |
