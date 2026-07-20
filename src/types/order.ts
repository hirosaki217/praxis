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