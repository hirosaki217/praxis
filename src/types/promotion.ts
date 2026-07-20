import type { ID, Money, Channel, ISODate } from './common'

export type DiscountType = 'percent' | 'fixed' | 'free_shipping' | 'bogo' | 'bundle'

export interface PromotionConditions {
  minOrder?: Money
  maxDiscount?: Money
  applicableChannels?: Channel[]
  applicableBranchIds?: ID[]
  applicableCategoryIds?: ID[]
  applicableProductIds?: ID[]
}

export interface Promotion {
  id: ID
  code: string
  name: string
  description?: string
  type: DiscountType
  value: number
  conditions: PromotionConditions
  validFrom: ISODate
  validTo: ISODate
  usageLimit?: number
  usedCount: number
  perCustomerLimit?: number
  active: boolean
  autoApply?: boolean
}
