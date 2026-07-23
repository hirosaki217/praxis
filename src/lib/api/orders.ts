import type { CreateOrderInput } from '@/validation/order'
import type { Order, OrderStatus, Channel } from '@/types'
import { ApiError } from './storefront'

export interface GetOrdersParams {
  status?: OrderStatus
  channel?: Channel
}

export interface UpdateOrderStatusInput {
  id: string
  status: OrderStatus
}

export async function getOrders(params: GetOrdersParams = {}): Promise<Order[]> {
  const searchParams = new URLSearchParams()
  if (params.status) searchParams.set('status', params.status)
  if (params.channel) searchParams.set('channel', params.channel)
  const query = searchParams.toString()
  const response = await fetch(query ? `/api/orders?${query}` : '/api/orders')

  if (!response.ok) {
    throw new ApiError('Failed to fetch orders', response.status)
  }

  return (await response.json()) as Order[]
}

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

export async function updateOrderStatus(input: UpdateOrderStatusInput): Promise<Order> {
  const response = await fetch(`/api/orders/${input.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: input.status }),
  })

  if (!response.ok) {
    throw new ApiError(`Failed to update order ${input.id}`, response.status)
  }

  return (await response.json()) as Order
}
