# Hướng dẫn P2 — Domain Types + Zod + Mock API (MSW)

> Tạo **data contract** (types + Zod) + **mock API** (MSW + localStorage) chạy ở mức network. Xong P2 → có `/api/products`, `/api/orders`… thật. Tham khảo [PROJECT_DESIGN §4–5](./PROJECT_DESIGN.md).
> Stack: TS 7 · Zod 4 · MSW 2 · alias `@/` = `src/`.

## 1. Nguyên tắc chia type/schema

| Nhóm | Nơi | Khi nào |
|---|---|---|
| **Read model** (entity) | `src/types/` | `interface` tay — dữ liệu seed tin cậy |
| **Input/mutation** | `src/validation/` (Zod) | `z.infer` → type — phải validate |

Không `any` · union thay enum · discriminated union cho phân nhánh (vd fulfilment theo kênh).

## 2. Cấu trúc thư mục

```
src/
├── types/
│   ├── common.ts        # Channel, OrderStatus, Money…
│   ├── product.ts       # Category, Product, Variant, Topping, Combo
│   ├── order.ts         # Order, OrderLine, Fulfilment, Totals
│   ├── customer.ts      # Customer, Address
│   ├── branch.ts        # Branch, DeliveryZone
│   ├── promotion.ts     # Promotion
│   └── index.ts         # re-export
├── validation/
│   ├── order.ts         # createOrderSchema…
│   └── promotion.ts     # validateVoucherSchema…
└── lib/mock/
    ├── seed.ts          # dataset mẫu
    ├── db.ts            # hydrate + localStorage + resetSeed
    ├── handlers/
    │   ├── products.ts
    │   ├── orders.ts
    │   ├── promotions.ts
    │   └── index.ts
    ├── browser.ts       # setupWorker (dev)
    └── server.ts        # setupServer (vitest)
```

## Bước 1 — `types/common.ts`

```ts
export type ID = string
export type Money = number          // VND, số nguyên (đồng)
export type ISODate = string        // ISO 8601

export type Channel = 'delivery' | 'pickup' | 'dine-in'
export type Size = 'S' | 'M' | 'L' | 'XL'
export type CrustType = 'thin' | 'thick' | 'cheese'

export type OrderStatus =
  | 'created' | 'confirmed' | 'preparing'
  | 'ready' | 'ready_for_pickup' | 'assigned_driver'
  | 'out_for_delivery' | 'served' | 'delivered' | 'picked_up'
  | 'completed' | 'cancelled' | 'refunded'

export type PaymentMethod = 'cod' | 'momo' | 'card' | 'zalopay'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}
```

## Bước 2 — Entity types

`types/product.ts`:
```ts
import type { ID, Money, Size, CrustType } from './common'

export interface Category { id: ID; name: string; slug: string; sortOrder: number }

export interface ProductVariant { id: ID; size: Size; crust?: CrustType; price: Money }

export interface Topping { id: ID; name: string; priceBySize: Record<Size, Money> }

export interface Product {
  id: ID
  name: string
  description: string
  categoryId: ID
  image?: string
  tags: string[]                 // 'vegetarian' | 'spicy' | 'new' | 'bestseller'
  variants: ProductVariant[]
  toppings: Topping[]
  available: boolean
}

export interface Combo {
  id: ID
  name: string
  items: { productId: ID; variantId: ID; qty: number }[]
  bundlePrice: Money
}
```

`types/order.ts` (lưu ý **discriminated union** cho fulfilment):
```ts
import type { ID, Money, Channel, OrderStatus, ISODate, PaymentMethod, PaymentStatus } from './common'

export interface OrderLineTopping { toppingId: ID; name: string; price: Money }

export interface OrderLine {
  id: ID
  productId: ID
  productName: string
  variantId: ID
  size: string
  crust?: string
  toppings: OrderLineTopping[]
  qty: number
  unitPrice: Money
  lineTotal: Money
}

export type Fulfilment =
  | { channel: 'delivery'; addressId: ID; fee: Money; driverName?: string }
  | { channel: 'pickup'; branchId: ID; slot: string }
  | { channel: 'dine-in'; branchId: ID; tableId: ID }

export interface OrderTotals {
  linesSubtotal: Money
  comboDiscount: Money
  orderDiscount: Money
  deliveryFee: Money
  tax: Money
  loyaltyDiscount: Money
  grandTotal: Money
  pointsToEarn: number
}

export interface Order {
  id: ID
  code: string                   // 'PF-20451'
  customerId?: ID
  customerName: string
  channel: Channel
  status: OrderStatus
  lines: OrderLine[]
  fulfilment: Fulfilment
  totals: OrderTotals
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  appliedPromotions: ID[]
  createdAt: ISODate
  updatedAt: ISODate
}
```

`types/branch.ts`:
```ts
import type { ID, Money } from './common'

export interface DeliveryZone {
  id: ID
  name: string
  radiusKm?: number
  fee: Money
  freeShipThreshold: Money
}
export interface OpeningHours { [day: string]: string | null }

export interface Branch {
  id: ID
  name: string
  slug: string
  address: string
  phone?: string
  lat?: number
  lng?: number
  openingHours: OpeningHours
  taxRate: number           // VAT, vd 0.08
  deliveryZones: DeliveryZone[]
  status: 'open' | 'closed'
}
```

`types/customer.ts`:
```ts
import type { ID, Money, ISODate } from './common'

export interface Address {
  id: ID; label: string; recipientName: string; phone: string
  street: string; ward: string; district: string; city: string
  lat?: number; lng?: number; isDefault: boolean
}
export type LoyaltyTier = 'bronze' | 'silver' | 'gold' | 'platinum'

export interface Customer {
  id: ID; name: string; phone: string; email?: string
  addresses: Address[]
  loyaltyPoints: number; loyaltyTier: LoyaltyTier
  totalSpent: Money; totalOrders: number
  status: 'active' | 'blacklist'
  createdAt: ISODate; lastOrderAt?: ISODate
}
```

`types/promotion.ts`:
```ts
import type { ID, Money, Channel, ISODate } from './common'

export type DiscountType = 'percent' | 'fixed' | 'free_shipping' | 'bogo' | 'bundle'

export interface PromotionConditions {
  minOrder?: Money; maxDiscount?: Money
  applicableChannels?: Channel[]; applicableBranchIds?: ID[]
  applicableCategoryIds?: ID[]; applicableProductIds?: ID[]
}

export interface Promotion {
  id: ID; code: string; name: string; description?: string
  type: DiscountType; value: number
  conditions: PromotionConditions
  validFrom: ISODate; validTo: ISODate
  usageLimit?: number; usedCount: number; perCustomerLimit?: number
  active: boolean; autoApply?: boolean
}
```

`types/index.ts` re-export hết:
```ts
export * from './common'
export * from './product'
export * from './order'
export * from './branch'
export * from './customer'
export * from './promotion'
```

## Bước 3 — Zod schemas (`validation/`)

`validation/order.ts` — discriminated union + infer:
```ts
import { z } from 'zod'

const deliveryFulfilment = z.object({ channel: z.literal('delivery'), addressId: z.string() })
const pickupFulfilment = z.object({ channel: z.literal('pickup'), branchId: z.string(), slot: z.string() })
const dineInFulfilment = z.object({ channel: z.literal('dine-in'), branchId: z.string(), tableId: z.string() })
const fulfilmentSchema = z.discriminatedUnion('channel', [deliveryFulfilment, pickupFulfilment, dineInFulfilment])

const orderLineSchema = z.object({
  productId: z.string(),
  variantId: z.string(),
  qty: z.number().int().positive(),
  toppings: z.array(z.object({ toppingId: z.string() })).default([]),
})

export const createOrderSchema = z.object({
  channel: z.enum(['delivery', 'pickup', 'dine-in']),
  lines: z.array(orderLineSchema).min(1, 'Cần ít nhất 1 món'),
  fulfilment: fulfilmentSchema,
  paymentMethod: z.enum(['cod', 'momo', 'card', 'zalopay']),
  promotionCodes: z.array(z.string()).optional(),
})
export type CreateOrderInput = z.infer<typeof createOrderSchema>
```

> types = read model (đã có ở Bước 2), Zod = input. Không trùng lặp: input chỉ cần đủ trường gửi lên, engine sẽ tính `totals`.

## Bước 4 — `lib/mock/seed.ts` + `db.ts`

`seed.ts` (viết vài phần tử, mở rộng sau — PROJECT_DESIGN §4 yêu cầu ≥3 chi nhánh, ~30 sản phẩm):
```ts
import type { Category, Product, Order, Branch, Customer, Promotion } from '@/types'

export interface SeedData {
  categories: Category[]
  products: Product[]
  branches: Branch[]
  customers: Customer[]
  promotions: Promotion[]
  orders: Order[]
}

export const seedData: SeedData = {
  categories: [{ id: 'cat-pizza', name: 'Pizza', slug: 'pizza', sortOrder: 1 } /* , ... */],
  products: [/* ~30 product với variants + toppings */],
  branches: [/* 3 chi nhánh + delivery zones */],
  customers: [/* ... */],
  promotions: [/* ~10 voucher */],
  orders: [/* vài chục đơn đa trạng thái/kênh */],
}
```

`db.ts` — hydrate từ localStorage, fallback seed:
```ts
import { seedData, type SeedData } from './seed'

const KEY = 'pizzaforge:db:v1'
type DB = SeedData

function hydrate(): DB {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as DB
  } catch { /* bỏ qua */ }
  return structuredClone(seedData)
}

let db: DB = hydrate()

export const getDB = (): DB => db
export function persist(): void { localStorage.setItem(KEY, JSON.stringify(db)) }
export function resetSeed(): DB { db = structuredClone(seedData); persist(); return db }
```

> `structuredClone` để seed không bị mutate. Handler mutate `getDB()` rồi gọi `persist()`.

## Bước 5 — MSW handlers

`handlers/products.ts`:
```ts
import { http, HttpResponse } from 'msw'
import { getDB } from '../db'

export const productHandlers = [
  http.get('/api/products', ({ request }) => {
    const url = new URL(request.url)
    const categoryId = url.searchParams.get('categoryId')
    const search = url.searchParams.get('search')?.toLowerCase()
    let items = getDB().products.filter((p) => p.available)
    if (categoryId) items = items.filter((p) => p.categoryId === categoryId)
    if (search) items = items.filter((p) => p.name.toLowerCase().includes(search))
    return HttpResponse.json(items)
  }),
  http.get('/api/products/:id', ({ params }) => {
    const p = getDB().products.find((x) => x.id === params.id)
    return p ? HttpResponse.json(p) : new HttpResponse(null, { status: 404 })
  }),
]
```

`handlers/orders.ts` (POST tạo đơn — gọi pricing engine ở P3, tạm tính đơn giản):
```ts
import { http, HttpResponse } from 'msw'
import { getDB, persist } from '../db'

export const orderHandlers = [
  http.get('/api/orders', ({ request }) => {
    const url = new URL(request.url)
    const status = url.searchParams.get('status')
    let items = getDB().orders
    if (status) items = items.filter((o) => o.status === status)
    return HttpResponse.json(items)
  }),
  http.post('/api/orders', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>
    // P3: chạy createOrderSchema.parse(body) + pricing engine
    const newOrder = { /* build order từ body, sinh id/code/totals */ } as never
    getDB().orders.unshift(newOrder)
    persist()
    return HttpResponse.json(newOrder, { status: 201 })
  }),
  http.patch('/api/orders/:id', async ({ params, request }) => {
    const o = getDB().orders.find((x) => x.id === params.id)
    if (!o) return new HttpResponse(null, { status: 404 })
    const body = (await request.json()) as { status?: string }
    // P3: kiểm tra qua order state machine
    if (body.status) o.status = body.status as never
    o.updatedAt = new Date().toISOString()
    persist()
    return HttpResponse.json(o)
  }),
]
```

`handlers/index.ts`:
```ts
import { productHandlers } from './products'
import { orderHandlers } from './orders'
import { promotionHandlers } from './promotions'
export const handlers = [...productHandlers, ...orderHandlers, ...promotionHandlers]
```

## Bước 6 — `browser.ts` + `server.ts` + worker file

`browser.ts` (chạy dev):
```ts
import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'
export const worker = setupWorker(handlers)
```

`server.ts` (cho vitest):
```ts
import { setupServer } from 'msw/node'
import { handlers } from './handlers'
export const server = setupServer(...handlers)
```

Tạo worker file (chạy 1 lần):
```bash
npx msw init public/ --save
```

## Bước 7 — bật MSW trong `main.tsx`

```ts
async function enableMocking() {
  if (import.meta.env.DEV && !import.meta.env.VITE_API_URL) {
    const { worker } = await import('@/lib/mock/browser')
    await worker.start({ onUnhandledRequest: 'warn' })
  }
}

enableMocking().then(() => {
  // ReactDOM.createRoot(...).render(...)
})
```

> Có `VITE_API_URL` thì MSW tự tắt → sau này cắm API thật không cần đụng code.

## Bước 8 — Verify

1. `npx msw init public/ --save` (đã có `public/mockServiceWorker.js`).
2. `npm run dev`.
3. Mở DevTools → Network: request `/api/products` trả 200 + JSON.
4. Test nhanh trong console: `fetch('/api/products').then(r=>r.json()).then(console.log)`.
5. POST đơn → reload → đơn còn (localStorage persist).
6. `db.resetSeed()` trong console để khôi phục seed.

## Checklist + thứ tự làm

1. [ ] `types/common.ts` → `index.ts`
2. [ ] `types/product.ts`, `order.ts`, `customer.ts`, `branch.ts`, `promotion.ts`
3. [ ] `validation/order.ts`, `validation/promotion.ts`
4. [ ] `lib/mock/seed.ts` (đủ phong phú)
5. [ ] `lib/mock/db.ts`
6. [ ] `lib/mock/handlers/*` + `index.ts`
7. [ ] `lib/mock/browser.ts` + `server.ts`
8. [ ] `npx msw init public/ --save`
9. [ ] `main.tsx` enable MSW
10. [ ] Verify Network + persist

## Lỗi thường gặp

- **`Cannot find module 'msw/browser'`** → MSW v2; entry là `msw/browser`, đảm bảo `msw@2`.
- **MSW không bắt request** → thiếu `public/mockServiceWorker.js` (chạy `npx msw init`), hoặc quên `worker.start()`.
- **`localStorage is not defined`** → `db.ts` import ở node test mà chưa mock; dùng `server.ts` + vitest setup riêng.
- **Type `params.id`** → MSW v2 trả `params` là `Record<string,string|readonly string[]>`; ép kiểu nếu cần.
- **Zod v4** → `z.string().min(1)` cho required; discriminated union dùng `z.discriminatedUnion('channel', [...])`.

> Xong P2 → sang **P3: pricing engine + order state machine** (pure logic + unit test) — dùng lại types vừa tạo.
