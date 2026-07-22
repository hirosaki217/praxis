import type { Money, Size, ProductVariant, Topping, OrderTotals } from '@/types'
import type { ComputeOrderInput } from './types'
import { isPromotionApplicable, computePromotionDiscount } from './voucher'

/** Hằng số loyalty (sau này có thể move sang settings). */
export const EARN_RATE_VND_PER_POINT = 10000 // tiêu 10k → tích 1 điểm
export const REDEEM_VND_PER_POINT = 20 // 1 điểm = 20đ khi đổi

/* ---------------- line-level ---------------- */

export function toppingPrice(topping: Topping, size: Size): Money {
  return topping.priceBySize[size] ?? 0
}

/** Đơn giá 1 line = giá biến thể + tổng topping (theo size). */
export function lineUnitPrice(
  variant: ProductVariant,
  availableToppings: Topping[],
  selectedToppingIds: string[],
  size: Size,
): Money {
  const toppingsTotal = selectedToppingIds.reduce((s, id) => {
    const t = availableToppings.find((x) => x.id === id)
    return s + (t ? toppingPrice(t, size) : 0)
  }, 0)
  return variant.price + toppingsTotal
}

/* ---------------- order-level ---------------- */

/**
 * Tính breakdown tổng đơn (pure). Thứ tự:
 * line subtotal → giảm combo → voucher → phí ship (free ship?) → VAT (sau giảm) → đổi điểm → grand total.
 */
export function computeOrderTotals(input: ComputeOrderInput): OrderTotals {
  const linesSubtotal = sum(input.lines, (l) => l.unitPrice * l.qty)
  const comboDiscount = sum(input.lines, (l) => l.bundleDiscount ?? 0)
  const baseForVoucher = Math.max(0, linesSubtotal - comboDiscount)

  const now = input.now ?? Date.now()
  const ctx = { orderTotal: baseForVoucher, channel: input.channel }

  const applicable = input.promotions.filter((p) => isPromotionApplicable(p, ctx, now))
  const orderDiscount = applicable.reduce(
    (s, p) => s + computePromotionDiscount(p, baseForVoucher),
    0,
  )

  const freeShipping = applicable.some((p) => p.type === 'free_shipping')
  const deliveryFee = input.channel === 'delivery' && !freeShipping ? input.deliveryFee : 0

  const afterDiscount = Math.max(0, linesSubtotal - comboDiscount - orderDiscount)
  const tax = Math.round(afterDiscount * input.taxRate)

  const loyaltyDiscount = input.loyaltyRedeemPoints
    ? Math.min(input.loyaltyRedeemPoints * REDEEM_VND_PER_POINT, afterDiscount)
    : 0

  const grandTotal = Math.max(
    0,
    linesSubtotal - comboDiscount - orderDiscount - loyaltyDiscount + deliveryFee + tax,
  )
  const pointsToEarn = Math.floor(grandTotal / EARN_RATE_VND_PER_POINT)

  return {
    linesSubtotal,
    comboDiscount,
    orderDiscount,
    deliveryFee,
    tax,
    loyaltyDiscount,
    grandTotal,
    pointsToEarn,
  }
}

function sum<T>(arr: T[], fn: (x: T) => number): number {
  return arr.reduce((s, x) => s + fn(x), 0)
}
