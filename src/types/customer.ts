import type { ID, Money, ISODate } from './common'

export interface Address {
  id: ID
  label: string
  recipientName: string
  phone: string
  street: string
  ward: string
  district: string
  city: string
  lat?: number
  lng?: number
  isDefault: boolean
}

export type LoyaltyTier = 'bronze' | 'silver' | 'gold' | 'platinum'

export interface Customer {
  id: ID
  name: string
  phone: string
  email?: string
  addresses: Address[]
  loyaltyPoints: number
  loyaltyTier: LoyaltyTier
  totalSpent: Money
  totalOrders: number
  status: 'active' | 'blacklist'
  createdAt: ISODate
  lastOrderAt?: ISODate
}
