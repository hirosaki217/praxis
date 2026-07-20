import type { ID, Money } from './common'

export interface DeliveryZone {
  id: ID
  name: string
  radiusKm?: number
  fee: Money
  freeShipThreshold: Money
}

export interface OpeningHours {
  [day: string]: string | null
}

export interface Branch {
  id: ID
  name: string
  slug: string
  address: string
  phone?: string
  lat?: number
  lng?: number
  openingHours: OpeningHours
  taxRate: number
  deliveryZones: DeliveryZone[]
  status: 'open' | 'closed'
}
