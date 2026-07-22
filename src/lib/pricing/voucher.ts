import type { Promotion, Money } from '@/types'
import type { VoucherContext } from './types'

/** Kiểm tra voucher có áp dụng được cho đơn hiện tại không (pure; `now` để test). */
export function isPromotionApplicable(
  promo: Promotion,
  ctx: VoucherContext,
  now: number = Date.now(),
): boolean {
  if (!promo.active) return false

  const from = new Date(promo.validFrom).getTime()
  const to = new Date(promo.validTo).getTime()
  if (Number.isNaN(from) || Number.isNaN(to)) return false
  if (now < from || now > to) return false

  if (promo.conditions.minOrder !== undefined && ctx.orderTotal < promo.conditions.minOrder) return false
  if (promo.conditions.applicableChannels && !promo.conditions.applicableChannels.includes(ctx.channel))
    return false
  if (
    promo.conditions.applicableBranchIds &&
    ctx.branchId &&
    !promo.conditions.applicableBranchIds.includes(ctx.branchId)
  )
    return false
  if (promo.usageLimit !== undefined && promo.usedCount >= promo.usageLimit) return false

  return true
}

/** Tính số tiền giảm của 1 voucher trên `orderTotal` (sau combo, trước tax/fee). */
export function computePromotionDiscount(promo: Promotion, orderTotal: Money): Money {
  switch (promo.type) {
    case 'percent': {
      const raw = Math.round((orderTotal * promo.value) / 100)
      const cap = promo.conditions.maxDiscount ?? Number.MAX_SAFE_INTEGER
      return Math.min(raw, cap)
    }
    case 'fixed':
      return Math.min(promo.value, orderTotal)
    case 'free_shipping':
    case 'bogo':
    case 'bundle':
      // free_shipping xử lý ở phí ship; bogo/bundle xử lý ở line — không trừ ở đây
      return 0
    default:
      return 0
  }
}
