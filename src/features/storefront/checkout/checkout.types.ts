import type { CreateOrderInput } from '@/validation/order'
import type { Address, Channel, PaymentMethod } from '@/types'
import type { CartLine } from '@/features/storefront/cart/cart.types'

export interface CheckoutValues {
  customerName: string
  customerPhone: string
  paymentMethod: PaymentMethod
  addressId: string
  deliveryNote?: string
  pickupBranchId: string
  pickupSlot: string
  dineInBranchId: string
  tableId: string
}

export function createCheckoutDefaults(args: {
  channel: Channel
  address?: Address
  customerName?: string
  customerPhone?: string
}): CheckoutValues {
  return {
    customerName: args.customerName ?? '',
    customerPhone: args.customerPhone ?? '',
    paymentMethod: 'cod',
    addressId: args.address?.id ?? '',
    deliveryNote: '',
    pickupBranchId: '',
    pickupSlot: '11:30–12:00',
    dineInBranchId: '',
    tableId: '',
  }
}

export function mapCartLinesToOrderLines(lines: CartLine[]): CreateOrderInput['lines'] {
  return lines.map((line) => ({
    productId: line.productId,
    variantId: line.variantId,
    qty: line.qty,
    toppings: line.toppings.map((topping) => ({ toppingId: topping.toppingId })),
  }))
}
