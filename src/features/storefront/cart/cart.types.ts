import type { Branch, CrustType, Money, Product, ProductVariant, Size, Topping } from '@/types'

export interface CartLineTopping {
  toppingId: string
  name: string
  price: Money
}

export interface CartLine {
  id: string
  productId: string
  productName: string
  categoryId: string
  variantId: string
  size: Size
  crust?: CrustType
  qty: number
  unitPrice: Money
  lineTotal: Money
  toppings: CartLineTopping[]
}

export interface CartOperationalContext {
  branchId?: string
  taxRate: number
  deliveryFee: Money
}

export interface AddCartLineInput {
  product: Product
  variant: ProductVariant
  qty: number
  selectedToppings: Topping[]
}

export const DEFAULT_CART_CONTEXT: CartOperationalContext = {
  taxRate: 0.08,
  deliveryFee: 25_000,
}

export function createCartLineId(input: {
  productId: string
  variantId: string
  toppingIds: string[]
}) {
  return [input.productId, input.variantId, ...[...input.toppingIds].sort()].join('::')
}

export function deriveCartContextFromBranch(branch: Branch): CartOperationalContext {
  return {
    branchId: branch.id,
    taxRate: branch.taxRate,
    deliveryFee: branch.deliveryZones[0]?.fee ?? DEFAULT_CART_CONTEXT.deliveryFee,
  }
}

export function buildCartLine({ product, variant, qty, selectedToppings }: AddCartLineInput): CartLine {
  const lineId = createCartLineId({
    productId: product.id,
    variantId: variant.id,
    toppingIds: selectedToppings.map((topping) => topping.id),
  })
  const normalizedToppings = selectedToppings.map((topping) => ({
    toppingId: topping.id,
    name: topping.name,
    price: topping.priceBySize[variant.size] ?? 0,
  }))
  const unitPrice = variant.price + normalizedToppings.reduce((sum, topping) => sum + topping.price, 0)

  return {
    id: lineId,
    productId: product.id,
    productName: product.name,
    categoryId: product.categoryId,
    variantId: variant.id,
    size: variant.size,
    crust: variant.crust,
    qty,
    unitPrice,
    lineTotal: unitPrice * qty,
    toppings: normalizedToppings,
  }
}
