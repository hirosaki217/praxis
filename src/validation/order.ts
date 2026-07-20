import { z } from 'zod'

const deliveryFulfilment = z.object({ channel: z.literal('delivery'), addressId: z.string() })
const pickupFulfilment = z.object({ channel: z.literal('pickup'), branchId: z.string(), slot: z.string() })
const dineInFulfilment = z.object({ channel: z.literal('dine-in'), branchId: z.string(), tableId: z.string() })
const fulfilmentSchema = z.discriminatedUnion('channel', [deliveryFulfilment, pickupFulfilment, dineInFulfilment])

const orderLineSchema = z.object({
  productId: z.string(),
  variantId: z.string(),
  qty: z.number().int().positive(),
  toppings: z.array(z.object({ toppingId: z.string() })).default([]),
})

export const createOrderSchema = z.object({
  channel: z.enum(['delivery', 'pickup', 'dine-in']),
  lines: z.array(orderLineSchema).min(1, 'Cần ít nhất 1 món'),
  fulfilment: fulfilmentSchema,
  paymentMethod: z.enum(['cod', 'momo', 'card', 'zalopay']),
  promotionCodes: z.array(z.string()).optional(),
})
export type CreateOrderInput = z.infer<typeof createOrderSchema>