import type { CreateOrderInput } from '@/validation/order'
import type { Order } from '@/types'
import { ApiError } from './storefront'

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const response = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    throw new ApiError('Failed to create order', response.status)
  }

  return (await response.json()) as Order
}

export async function getOrderById(id: string): Promise<Order> {
  const response = await fetch(`/api/orders/${id}`)

  if (!response.ok) {
    throw new ApiError(`Failed to fetch order ${id}`, response.status)
  }

  return (await response.json()) as Order
}
