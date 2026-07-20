import type {
  Category,
  Product,
  ProductVariant,
  Topping,
  Size,
  Branch,
  Customer,
  Promotion,
  Order,
  OrderLine,
  Fulfilment,
  OrderTotals,
  Channel,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from '@/types'

export interface SeedData {
  categories: Category[]
  products: Product[]
  branches: Branch[]
  customers: Customer[]
  promotions: Promotion[]
  orders: Order[]
}

/* ---------------- helpers (giữ seed gọn) ---------------- */
const SIZES: Size[] = ['S', 'M', 'L', 'XL']
const STEP: Record<Size, number> = { S: 0, M: 60000, L: 120000, XL: 190000 }

function variants(pid: string, base: number): ProductVariant[] {
  return SIZES.map((size) => ({ id: `${pid}-${size.toLowerCase()}`, size, price: base + STEP[size] }))
}

const TOPPINGS: Topping[] = [
  { id: 'top-cheese', name: 'Extra Cheese', priceBySize: { S: 10000, M: 15000, L: 20000, XL: 25000 } },
  { id: 'top-pepperoni', name: 'Pepperoni', priceBySize: { S: 15000, M: 20000, L: 25000, XL: 30000 } },
  { id: 'top-mushroom', name: 'Nấm', priceBySize: { S: 8000, M: 12000, L: 15000, XL: 18000 } },
  { id: 'top-pepper', name: 'Ớt xanh', priceBySize: { S: 7000, M: 10000, L: 13000, XL: 16000 } },
  { id: 'top-bacon', name: 'Bacon', priceBySize: { S: 15000, M: 22000, L: 28000, XL: 34000 } },
]

function pizza(id: string, name: string, base: number, tags: string[] = [], desc = ''): Product {
  return {
    id,
    name,
    description: desc,
    categoryId: 'cat-pizza',
    tags,
    variants: variants(id, base),
    toppings: TOPPINGS,
    available: true,
  }
}

function single(id: string, name: string, price: number, categoryId: string, tags: string[] = []): Product {
  return {
    id,
    name,
    description: '',
    categoryId,
    tags,
    variants: [{ id: `${id}-m`, size: 'M', price }],
    toppings: [],
    available: true,
  }
}

/* ---------------- categories ---------------- */
const categories: Category[] = [
  { id: 'cat-pizza', name: 'Pizza', slug: 'pizza', sortOrder: 1 },
  { id: 'cat-sides', name: 'Món kèm', slug: 'sides', sortOrder: 2 },
  { id: 'cat-drinks', name: 'Đồ uống', slug: 'drinks', sortOrder: 3 },
  { id: 'cat-desserts', name: 'Tráng miệng', slug: 'desserts', sortOrder: 4 },
]

/* ---------------- products ---------------- */
const products: Product[] = [
  pizza('prod-margherita', 'Margherita Classic', 99000, [], 'Phô mai mozzarella, sốt cà chua.'),
  pizza('prod-pepperoni', 'Pepperoni Feast', 129000, ['spicy', 'bestseller'], 'Pepperoni bọc phô mai, chút ớt.'),
  pizza('prod-veggie', 'Veggie Garden', 109000, ['vegetarian'], 'Nấm, ớt xanh, hành tây, ô liu.'),
  pizza('prod-bbq', 'BBQ Chicken', 139000, ['new'], 'Gà nướng BBQ, hành tây, phô mai.'),
  pizza('prod-hawaiian', 'Hawaiian', 119000, [], 'Thịt nguội, dứa, phô mai.'),
  pizza('prod-seafood', 'Seafood Deluxe', 159000, ['bestseller'], 'Tôm, mực, phô mai, sốt trắng.'),
  pizza('prod-quattro', 'Quattro Formaggi', 149000, [], '4 loại phô mai đậm vị.'),
  pizza('prod-spicy-beef', 'Spicy Beef', 129000, ['spicy'], 'Bò băm cay, ớt, phô mai.'),
  single('prod-garlic-bread', 'Bánh mì tỏi', 59000, 'cat-sides'),
  single('prod-wings', 'Cánh gà nướng', 89000, 'cat-sides', ['bestseller']),
  single('prod-mozz-sticks', 'Mozzarella Sticks', 79000, 'cat-sides'),
  single('prod-coca', 'Coca-Cola', 25000, 'cat-drinks'),
  single('prod-sprite', 'Sprite', 25000, 'cat-drinks'),
  single('prod-oj', 'Nước cam', 35000, 'cat-drinks'),
  single('prod-choco-lava', 'Choco Lava Cake', 45000, 'cat-desserts'),
  single('prod-tiramisu', 'Tiramisu', 55000, 'cat-desserts'),
]

/* ---------------- branches ---------------- */
const branches: Branch[] = [
  {
    id: 'br-hcm-leloi',
    name: 'PizzaForge Lê Lợi',
    slug: 'le-loi-hcm',
    address: '123 Lê Lợi, Q.1, TP.HCM',
    phone: '028 7300 1234',
    taxRate: 0.08,
    status: 'open',
    openingHours: { mon: '09:00–23:00', tue: '09:00–23:00', sun: '09:00–23:00' },
    deliveryZones: [
      { id: 'z-hcm-1', name: 'Zone 1', radiusKm: 2, fee: 15000, freeShipThreshold: 200000 },
      { id: 'z-hcm-2', name: 'Zone 2', radiusKm: 4, fee: 25000, freeShipThreshold: 250000 },
      { id: 'z-hcm-3', name: 'Zone 3', radiusKm: 6, fee: 35000, freeShipThreshold: 300000 },
    ],
  },
  {
    id: 'br-hn-hoankiem',
    name: 'PizzaForge Hoàn Kiếm',
    slug: 'hoan-kiem-hn',
    address: '45 Lý Thường Kiệt, Hoàn Kiếm, HN',
    taxRate: 0.08,
    status: 'open',
    openingHours: { mon: '09:00–22:30', sun: '09:00–22:30' },
    deliveryZones: [
      { id: 'z-hn-1', name: 'Zone 1', radiusKm: 2, fee: 15000, freeShipThreshold: 200000 },
      { id: 'z-hn-2', name: 'Zone 2', radiusKm: 4, fee: 25000, freeShipThreshold: 250000 },
    ],
  },
  {
    id: 'br-dn-bachdang',
    name: 'PizzaForge Đà Nẵng',
    slug: 'bach-dang-dn',
    address: '12 Bạch Đằng, Hải Châu, ĐN',
    taxRate: 0.08,
    status: 'closed',
    openingHours: { mon: '10:00–22:00', sun: '10:00–22:00' },
    deliveryZones: [
      { id: 'z-dn-1', name: 'Zone 1', radiusKm: 3, fee: 20000, freeShipThreshold: 250000 },
    ],
  },
]

/* ---------------- customers ---------------- */
const customers: Customer[] = [
  {
    id: 'cus-1', name: 'Nguyễn Văn An', phone: '0901 234 567', email: 'an@mail.com',
    loyaltyPoints: 1240, loyaltyTier: 'gold', totalSpent: 14200000, totalOrders: 42,
    status: 'active', createdAt: '2025-03-12T08:00:00Z', lastOrderAt: '2026-07-20T04:25:00Z',
    addresses: [
      { id: 'addr-1', label: 'Nhà', recipientName: 'Nguyễn Văn An', phone: '0901 234 567', street: '123 Nguyễn Huệ', ward: 'Bến Nghé', district: 'Quận 1', city: 'TP.HCM', isDefault: true },
      { id: 'addr-2', label: 'Công ty', recipientName: 'Nguyễn Văn An', phone: '0901 234 567', street: '45 Lê Duẩn', ward: 'Bến Nghé', district: 'Quận 1', city: 'TP.HCM', isDefault: false },
    ],
  },
  {
    id: 'cus-2', name: 'Trần Thị Bình', phone: '0902 111 222', email: 'binh@mail.com',
    loyaltyPoints: 3150, loyaltyTier: 'platinum', totalSpent: 31500000, totalOrders: 88,
    status: 'active', createdAt: '2024-11-01T08:00:00Z', lastOrderAt: '2026-07-17T12:40:00Z',
    addresses: [{ id: 'addr-3', label: 'Nhà', recipientName: 'Trần Thị Bình', phone: '0902 111 222', street: '77 Trần Phú', ward: 'Phạm Ngũ Lão', district: 'Quận 1', city: 'TP.HCM', isDefault: true }],
  },
  {
    id: 'cus-3', name: 'Lê Hoàng Châu', phone: '0903 333 444',
    loyaltyPoints: 30, loyaltyTier: 'bronze', totalSpent: 289000, totalOrders: 1,
    status: 'active', createdAt: '2026-07-02T10:00:00Z',
    addresses: [{ id: 'addr-4', label: 'Nhà', recipientName: 'Lê Hoàng Châu', phone: '0903 333 444', street: '9 Pasteur', ward: 'Bến Nghé', district: 'Quận 1', city: 'TP.HCM', isDefault: true }],
  },
  {
    id: 'cus-4', name: 'Phạm Đình Dũng', phone: '0904 555 666',
    loyaltyPoints: 0, loyaltyTier: 'bronze', totalSpent: 0, totalOrders: 3,
    status: 'blacklist', createdAt: '2025-09-20T08:00:00Z', lastOrderAt: '2026-06-21T13:05:00Z',
    addresses: [{ id: 'addr-5', label: 'Nhà', recipientName: 'Phạm Đình Dũng', phone: '0904 555 666', street: '5 CMT8', ward: 'Phạm Ngũ Lão', district: 'Quận 1', city: 'TP.HCM', isDefault: true }],
  },
  {
    id: 'cus-5', name: 'Võ Emerald', phone: '0905 777 888',
    loyaltyPoints: 520, loyaltyTier: 'silver', totalSpent: 5200000, totalOrders: 18,
    status: 'active', createdAt: '2025-06-10T08:00:00Z', lastOrderAt: '2026-07-19T18:20:00Z',
    addresses: [{ id: 'addr-6', label: 'Nhà', recipientName: 'Võ Emerald', phone: '0905 777 888', street: '30 Nguyễn Trãi', ward: 'Bến Thành', district: 'Quận 1', city: 'TP.HCM', isDefault: true }],
  },
  {
    id: 'cus-6', name: 'Đặng Giang', phone: '0906 999 000',
    loyaltyPoints: 180, loyaltyTier: 'bronze', totalSpent: 1800000, totalOrders: 6,
    status: 'active', createdAt: '2026-01-15T08:00:00Z', lastOrderAt: '2026-07-18T11:50:00Z',
    addresses: [{ id: 'addr-7', label: 'Nhà', recipientName: 'Đặng Giang', phone: '0906 999 000', street: '8 Hai Bà Trưng', ward: 'Bến Nghé', district: 'Quận 1', city: 'TP.HCM', isDefault: true }],
  },
]

/* ---------------- promotions ---------------- */
const promotions: Promotion[] = [
  {
    id: 'pm-pizza30', code: 'PIZZA30', name: 'Giảm 30%', type: 'percent', value: 30,
    description: 'Giảm 30% đơn hàng',
    conditions: { minOrder: 200000, maxDiscount: 150000, applicableChannels: ['delivery', 'pickup', 'dine-in'] },
    validFrom: '2026-07-01', validTo: '2026-07-31', usedCount: 412, active: true,
  },
  {
    id: 'pm-freeship', code: 'FREESHIP', name: 'Miễn phí ship', type: 'free_shipping', value: 0,
    conditions: { minOrder: 250000, applicableChannels: ['delivery'] },
    validFrom: '2026-01-01', validTo: '2026-12-31', usedCount: 1022, active: true,
  },
  {
    id: 'pm-weekend50', code: 'WEEKEND50', name: 'Cuối tuần -50k', type: 'fixed', value: 50000,
    conditions: { minOrder: 300000 },
    validFrom: '2026-07-01', validTo: '2026-12-31', usedCount: 88, usageLimit: 500, active: true,
  },
  {
    id: 'pm-bogo', code: 'BOGO', name: 'Mua 1 tặng 1', type: 'bogo', value: 0,
    conditions: { applicableCategoryIds: ['cat-pizza'] },
    validFrom: '2026-06-01', validTo: '2026-06-30', usedCount: 540, usageLimit: 540, active: false,
  },
  {
    id: 'pm-newuser', code: 'NEWUSER', name: 'Khách mới -40k', type: 'fixed', value: 40000,
    conditions: { minOrder: 150000, maxDiscount: 40000 },
    validFrom: '2026-01-01', validTo: '2026-12-31', usedCount: 230, active: true,
  },
  {
    id: 'pm-vip', code: 'VIP', name: 'VIP -10%', type: 'percent', value: 10,
    conditions: { maxDiscount: 100000 },
    validFrom: '2026-01-01', validTo: '2026-12-31', usedCount: 64, active: true, autoApply: false,
  },
  {
    id: 'pm-lunch', code: 'LUNCH20', name: 'Trưa -20k', type: 'fixed', value: 20000,
    conditions: { minOrder: 100000 },
    validFrom: '2026-07-01', validTo: '2026-12-31', usedCount: 12, active: true,
  },
  {
    id: 'pm-combo', code: 'COMBOGD', name: 'Combo Gia Đình', type: 'bundle', value: 30,
    conditions: { applicableCategoryIds: ['cat-pizza'] },
    validFrom: '2026-01-01', validTo: '2026-12-31', usedCount: 0, active: true, autoApply: true,
  },
]

/* ---------------- orders ---------------- */
const DAY = 86400000
function iso(daysAgo: number, hour = 12): string {
  const d = new Date(Date.now() - daysAgo * DAY)
  d.setUTCHours(hour - 7, 0, 0, 0) // giờ VN (~UTC+7) cho dễ đọc
  return d.toISOString()
}

let seq = 20440
function makeOrder(o: {
  customer: Customer
  channel: Channel
  status: OrderStatus
  items: Array<{ product: Product; size: Size; qty: number }>
  paymentMethod?: PaymentMethod
  paymentStatus?: PaymentStatus
  ageDays: number
  hour?: number
}): Order {
  const n = ++seq
  const lines: OrderLine[] = o.items.map((it, i) => {
    const v = it.product.variants.find((x) => x.size === it.size) ?? it.product.variants[0]
    if (!v) throw new Error('no variant for ' + it.product.id)
    return {
      id: `ol-${n}-${i}`,
      productId: it.product.id,
      productName: it.product.name,
      variantId: v.id,
      size: v.size,
      toppings: [],
      qty: it.qty,
      unitPrice: v.price,
      lineTotal: v.price * it.qty,
    }
  })
  const linesSubtotal = lines.reduce((s, l) => s + l.lineTotal, 0)
  const fee = o.channel === 'delivery' ? 25000 : 0
  const tax = Math.round((linesSubtotal + fee) * 0.08)
  const grandTotal = linesSubtotal + fee + tax
  const fulfilment: Fulfilment =
    o.channel === 'delivery'
      ? { channel: 'delivery', addressId: o.customer.addresses[0]?.id ?? 'addr-1', fee }
      : o.channel === 'pickup'
        ? { channel: 'pickup', branchId: 'br-hcm-leloi', slot: '11:30–12:00' }
        : { channel: 'dine-in', branchId: 'br-hcm-leloi', tableId: 'tbl-3' }
  const totals: OrderTotals = {
    linesSubtotal,
    comboDiscount: 0,
    orderDiscount: 0,
    deliveryFee: fee,
    tax,
    loyaltyDiscount: 0,
    grandTotal,
    pointsToEarn: Math.round(grandTotal / 10000),
  }
  const created = iso(o.ageDays, o.hour ?? 11)
  return {
    id: `ord-${n}`,
    code: `PF-${n}`,
    customerId: o.customer.id,
    customerName: o.customer.name,
    channel: o.channel,
    status: o.status,
    lines,
    fulfilment,
    totals,
    paymentMethod: o.paymentMethod ?? 'cod',
    paymentStatus: o.paymentStatus ?? (o.status === 'completed' ? 'paid' : 'pending'),
    appliedPromotions: [],
    createdAt: created,
    updatedAt: created,
  }
}

const find = (id: string) => products.find((p) => p.id === id)!

const orders: Order[] = [
  makeOrder({ customer: customers[0]!, channel: 'delivery', status: 'created', ageDays: 0, hour: 11, items: [{ product: find('prod-pepperoni'), size: 'M', qty: 2 }, { product: find('prod-coca'), size: 'M', qty: 2 }] }),
  makeOrder({ customer: customers[2]!, channel: 'delivery', status: 'confirmed', ageDays: 0, hour: 10, items: [{ product: find('prod-margherita'), size: 'L', qty: 1 }] }),
  makeOrder({ customer: customers[4]!, channel: 'dine-in', status: 'preparing', ageDays: 0, hour: 11, items: [{ product: find('prod-bbq'), size: 'L', qty: 1 }, { product: find('prod-wings'), size: 'M', qty: 1 }] }),
  makeOrder({ customer: customers[1]!, channel: 'delivery', status: 'preparing', ageDays: 0, hour: 9, items: [{ product: find('prod-seafood'), size: 'L', qty: 2 }] }),
  makeOrder({ customer: customers[5]!, channel: 'pickup', status: 'ready_for_pickup', ageDays: 0, hour: 10, items: [{ product: find('prod-hawaiian'), size: 'M', qty: 1 }] }),
  makeOrder({ customer: customers[0]!, channel: 'delivery', status: 'out_for_delivery', ageDays: 0, hour: 11, paymentMethod: 'momo', paymentStatus: 'paid', items: [{ product: find('prod-pepperoni'), size: 'L', qty: 1 }, { product: find('prod-garlic-bread'), size: 'M', qty: 1 }] }),
  makeOrder({ customer: customers[3]!, channel: 'delivery', status: 'delivered', ageDays: 1, hour: 19, items: [{ product: find('prod-quattro'), size: 'M', qty: 2 }] }),
  makeOrder({ customer: customers[1]!, channel: 'dine-in', status: 'served', ageDays: 0, hour: 12, paymentMethod: 'card', paymentStatus: 'paid', items: [{ product: find('prod-spicy-beef'), size: 'L', qty: 2 }] }),
  makeOrder({ customer: customers[2]!, channel: 'pickup', status: 'completed', ageDays: 1, hour: 12, paymentMethod: 'momo', paymentStatus: 'paid', items: [{ product: find('prod-margherita'), size: 'M', qty: 1 }] }),
  makeOrder({ customer: customers[4]!, channel: 'delivery', status: 'completed', ageDays: 2, hour: 20, paymentMethod: 'card', paymentStatus: 'paid', items: [{ product: find('prod-veggie'), size: 'L', qty: 1 }, { product: find('prod-tiramisu'), size: 'M', qty: 2 }] }),
  makeOrder({ customer: customers[5]!, channel: 'delivery', status: 'completed', ageDays: 3, hour: 12, items: [{ product: find('prod-bbq'), size: 'M', qty: 2 }, { product: find('prod-oj'), size: 'M', qty: 4 }] }),
  makeOrder({ customer: customers[0]!, channel: 'dine-in', status: 'completed', ageDays: 5, hour: 19, paymentMethod: 'card', paymentStatus: 'paid', items: [{ product: find('prod-seafood'), size: 'XL', qty: 1 }] }),
  makeOrder({ customer: customers[1]!, channel: 'delivery', status: 'cancelled', ageDays: 6, hour: 18, paymentStatus: 'refunded', items: [{ product: find('prod-hawaiian'), size: 'L', qty: 1 }] }),
  makeOrder({ customer: customers[4]!, channel: 'pickup', status: 'completed', ageDays: 4, hour: 12, paymentMethod: 'momo', paymentStatus: 'paid', items: [{ product: find('prod-pepperoni'), size: 'M', qty: 1 }] }),
]

/* ---------------- export ---------------- */
export const seedData: SeedData = {
  categories,
  products,
  branches,
  customers,
  promotions,
  orders,
}
