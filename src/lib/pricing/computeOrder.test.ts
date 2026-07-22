import { describe, it, expect } from 'vitest'
import { computeOrderTotals, lineUnitPrice } from './computeOrder'
import type { ComputeOrderInput } from './types'
import type { Promotion, ProductVariant, Topping } from '@/types'

const NOW = Date.parse('2026-07-15T00:00:00Z')

function promo(over: Partial<Promotion>): Promotion {
  return {
    id: 'p',
    code: 'X',
    name: 'X',
    type: 'percent',
    value: 10,
    conditions: {},
    validFrom: '2026-07-01',
    validTo: '2026-07-31',
    usedCount: 0,
    active: true,
    ...over,
  }
}

function input(over: Partial<ComputeOrderInput>): ComputeOrderInput {
  return {
    lines: [{ unitPrice: 100000, qty: 2 }],
    channel: 'pickup',
    deliveryFee: 25000,
    taxRate: 0.08,
    promotions: [],
    now: NOW,
    ...over,
  }
}

describe('computeOrderTotals', () => {
  it('subtotal + VAT, pickup không phí ship', () => {
    const t = computeOrderTotals(input({}))
    expect(t.linesSubtotal).toBe(200000)
    expect(t.tax).toBe(16000)
    expect(t.deliveryFee).toBe(0)
    expect(t.grandTotal).toBe(216000)
    expect(t.pointsToEarn).toBe(21) // floor(216000/10000)
  })

  it('cộng phí ship cho delivery', () => {
    const t = computeOrderTotals(input({ channel: 'delivery' }))
    expect(t.deliveryFee).toBe(25000)
    expect(t.grandTotal).toBe(241000)
  })

  it('voucher % có cap maxDiscount', () => {
    const t = computeOrderTotals(
      input({
        lines: [{ unitPrice: 250000, qty: 2 }], // 500000
        promotions: [promo({ type: 'percent', value: 30, conditions: { maxDiscount: 50000 } })],
      }),
    )
    expect(t.orderDiscount).toBe(50000) // 30% = 150000 → cap 50000
    expect(t.tax).toBe(36000) // (500000 - 50000) * 0.08
    expect(t.grandTotal).toBe(486000)
  })

  it('không áp voucher khi chưa đạt minOrder', () => {
    const t = computeOrderTotals(
      input({ promotions: [promo({ type: 'percent', value: 30, conditions: { minOrder: 500000 } })] }),
    )
    expect(t.orderDiscount).toBe(0)
  })

  it('voucher fixed không vượt subtotal', () => {
    const t = computeOrderTotals(
      input({
        lines: [{ unitPrice: 100000, qty: 1 }],
        promotions: [promo({ type: 'fixed', value: 150000 })],
      }),
    )
    expect(t.orderDiscount).toBe(100000)
  })

  it('free_shipping → phí ship 0', () => {
    const t = computeOrderTotals(
      input({ channel: 'delivery', promotions: [promo({ type: 'free_shipping', value: 0 })] }),
    )
    expect(t.deliveryFee).toBe(0)
  })

  it('đổi điểm loyalty (cap ở afterDiscount)', () => {
    const t = computeOrderTotals(input({ loyaltyRedeemPoints: 1000 }))
    expect(t.loyaltyDiscount).toBe(20000) // 1000 * 20
  })

  it('bỏ qua voucher hết hạn', () => {
    const t = computeOrderTotals(
      input({ promotions: [promo({ validFrom: '2026-08-01', validTo: '2026-08-31' })] }),
    )
    expect(t.orderDiscount).toBe(0)
  })

  it('bỏ qua voucher inactive / hết lượt dùng', () => {
    const t = computeOrderTotals(
      input({
        promotions: [
          promo({ active: false }),
          promo({ usageLimit: 100, usedCount: 100 }),
        ],
      }),
    )
    expect(t.orderDiscount).toBe(0)
  })
})

describe('lineUnitPrice', () => {
  const variant: ProductVariant = { id: 'v', size: 'M', price: 150000 }
  const toppings: Topping[] = [
    { id: 'cheese', name: 'Cheese', priceBySize: { S: 10000, M: 15000, L: 20000, XL: 25000 } },
    { id: 'bacon', name: 'Bacon', priceBySize: { S: 15000, M: 22000, L: 28000, XL: 34000 } },
  ]

  it('giá biến thể + topping theo size', () => {
    expect(lineUnitPrice(variant, toppings, ['cheese', 'bacon'], 'M')).toBe(150000 + 15000 + 22000)
  })
  it('không topping thì = giá biến thể', () => {
    expect(lineUnitPrice(variant, toppings, [], 'L')).toBe(150000)
  })
  it('bỏ qua topping id không tồn tại', () => {
    expect(lineUnitPrice(variant, toppings, ['unknown'], 'M')).toBe(150000)
  })
})
