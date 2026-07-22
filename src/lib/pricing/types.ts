import type { Money, Channel, Promotion } from '@/types'

export interface PricingLine {
  unitPrice: Money
  qty: number
  bundleDiscount?: Money
}

export interface ComputeOrderInput {
  lines: PricingLine[]
  channel: Channel
  deliveryFee: Money
  taxRate: number
  promotions: Promotion[]
  loyaltyRedeemPoints?: number
  now?: number
}

export interface VoucherContext {
  orderTotal: Money
  channel: Channel
  branchId?: string
}
