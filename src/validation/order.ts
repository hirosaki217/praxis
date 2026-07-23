import { z } from 'zod'

const deliveryFulfilment = z.object({
  channel: z.literal('delivery'),
  addressId: z.string().min(1, 'Chọn địa chỉ giao hàng'),
  note: z.string().optional(),
})
const pickupFulfilment = z.object({
  channel: z.literal('pickup'),
  branchId: z.string().min(1, 'Chọn chi nhánh'),
  slot: z.string().min(1, 'Chọn khung giờ nhận hàng'),
})
const dineInFulfilment = z.object({
  channel: z.literal('dine-in'),
  branchId: z.string().min(1, 'Chọn chi nhánh'),
  tableId: z.string().min(1, 'Nhập số bàn'),
})
const fulfilmentSchema = z.discriminatedUnion('channel', [deliveryFulfilment, pickupFulfilment, dineInFulfilment])

const orderLineSchema = z.object({
  productId: z.string(),
  variantId: z.string(),
  qty: z.number().int().positive(),
  toppings: z.array(z.object({ toppingId: z.string() })).default([]),
})

export const createOrderSchema = z.object({
  channel: z.enum(['delivery', 'pickup', 'dine-in']),
  customerName: z.string().min(2, 'Nhập tên người nhận'),
  customerPhone: z.string().min(8, 'Nhập số điện thoại hợp lệ'),
  lines: z.array(orderLineSchema).min(1, 'Cần ít nhất 1 món'),
  fulfilment: fulfilmentSchema,
  paymentMethod: z.enum(['cod', 'momo', 'card', 'zalopay']),
  promotionCodes: z.array(z.string()).optional(),
})
export type CreateOrderInput = z.infer<typeof createOrderSchema>
