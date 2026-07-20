import type { ID, Money, Size, CrustType } from './common';

export interface Category { id: ID; name: string; slug: string; sortOrder: number }

export interface ProductVariant { id: ID; size: Size; crust?: CrustType; price: Money }

export interface Topping {id: ID; name: string; priceBySize: Record<Size, Money> }

export interface Product {
    id: ID
    name: string
    description: string
    categoryId: ID,
    image?: string,
    tags: string[], // 'vegetarian' | 'spicy' | 'new' | 'bestseller'
    variants: ProductVariant[],
    toppings: Topping[]
    available: boolean
}

export interface Combo {
  id: ID
  name: string
  items: { productId: ID; variantId: ID; qty: number }[]
  bundlePrice: Money
}