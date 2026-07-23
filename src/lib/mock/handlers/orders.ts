import { http, HttpResponse } from 'msw'
import { getDB, persist } from '../db'
import { createOrderSchema } from '@/validation/order'
import { computeOrderTotals, lineUnitPrice, type PricingLine } from '@/lib/pricing'
import { canTransition } from '@/lib/orders'
import type { Order, OrderLine, OrderStatus, Fulfilment, Promotion } from '@/types'

const DEFAULT_DELIVERY_FEE = 25000

export const orderHandlers = [
  http.get('/api/orders', ({ request }) => {
    const url = new URL(request.url)
    const status = url.searchParams.get('status') as OrderStatus | null
    const channel = url.searchParams.get('channel')
    let items = getDB().orders
    if (status) items = items.filter((o) => o.status === status)
    if (channel) items = items.filter((o) => o.channel === channel)
    return HttpResponse.json(items)
  }),

  http.get('/api/orders/:id', ({ params }) => {
    const id = params.id as string
    const o = getDB().orders.find((x) => x.id === id)
    return o ? HttpResponse.json(o) : new HttpResponse(null, { status: 404 })
  }),

  http.post('/api/orders', async ({ request }) => {
    const parsed = createOrderSchema.safeParse(await request.json())
    if (!parsed.success) {
      return HttpResponse.json({ errors: parsed.error.issues }, { status: 422 })
    }
    const input = parsed.data
    const db = getDB()

    const lines: OrderLine[] = input.lines.map((l, i) => {
      const product = db.products.find((p) => p.id === l.productId)
      const variant = product?.variants?.find((v) => v.id === l.variantId) ?? product?.variants?.[0]
      const size = variant?.size ?? 'M'
      const selectedToppingIds = l.toppings.map((t) => t.toppingId)
      const unit = variant ? lineUnitPrice(variant, product?.toppings ?? [], selectedToppingIds, size) : 0
      return {
        id: `ol-new-${i}`,
        productId: l.productId,
        productName: product?.name ?? '',
        variantId: variant?.id ?? l.variantId,
        size,
        toppings: (product?.toppings ?? [])
          .filter((topping) => selectedToppingIds.includes(topping.id))
          .map((topping) => ({
            toppingId: topping.id,
            name: topping.name,
            price: topping.priceBySize[size] ?? 0,
          })),
        qty: l.qty,
        unitPrice: unit,
        lineTotal: unit * l.qty,
      }
    })

    const branchId = input.fulfilment.channel === 'delivery' ? undefined : input.fulfilment.branchId
    const taxRate = db.branches.find((b) => b.id === branchId)?.taxRate ?? 0.08
    const promotions: Promotion[] = (input.promotionCodes ?? [])
      .map((code) => db.promotions.find((p) => p.code === code.toUpperCase()))
      .filter((p): p is Promotion => Boolean(p))

    const pricingLines: PricingLine[] = lines.map((l) => ({ unitPrice: l.unitPrice, qty: l.qty }))
    const totals = computeOrderTotals({
      lines: pricingLines,
      channel: input.channel,
      deliveryFee: DEFAULT_DELIVERY_FEE,
      taxRate,
      promotions,
    })

    const fulfilment: Fulfilment =
      input.fulfilment.channel === 'delivery'
        ? {
            channel: 'delivery',
            addressId: input.fulfilment.addressId,
            fee: totals.deliveryFee,
            note: input.fulfilment.note,
          }
        : input.fulfilment.channel === 'pickup'
          ? { channel: 'pickup', branchId: input.fulfilment.branchId, slot: input.fulfilment.slot }
          : { channel: 'dine-in', branchId: input.fulfilment.branchId, tableId: input.fulfilment.tableId }

    const maxNum = db.orders.reduce((m, o) => {
      const n = Number(o.code.replace('PF-', ''))
      return Number.isNaN(n) ? m : Math.max(m, n)
    }, 20440)
    const num = maxNum + 1
    const now = new Date().toISOString()

    const order: Order = {
      id: `ord-${num}`,
      code: `PF-${num}`,
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      channel: input.channel,
      status: 'created',
      lines,
      fulfilment,
      totals,
      paymentMethod: input.paymentMethod,
      paymentStatus: 'pending',
      appliedPromotions: promotions.map((p) => p.id),
      createdAt: now,
      updatedAt: now,
    }

    db.orders.unshift(order)
    persist()
    return HttpResponse.json(order, { status: 201 })
  }),

  http.patch('/api/orders/:id', async ({ params, request }) => {
    const id = params.id as string
    const o = getDB().orders.find((x) => x.id === id)
    if (!o) return new HttpResponse(null, { status: 404 })
    const body = (await request.json()) as { status?: OrderStatus }

    if (body.status && body.status !== o.status) {
      if (!canTransition(o.channel, o.status, body.status)) {
        return HttpResponse.json(
          { message: `Không thể chuyển trạng thái: ${o.status} → ${body.status} (kênh ${o.channel})` },
          { status: 409 },
        )
      }
      o.status = body.status
    }
    o.updatedAt = new Date().toISOString()
    persist()
    return HttpResponse.json(o)
  }),
]
