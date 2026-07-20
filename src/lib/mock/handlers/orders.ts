import { http, HttpResponse } from 'msw'
import { getDB, persist } from '../db'
import { createOrderSchema } from '@/validation/order'
import type { Order, OrderLine, OrderStatus, Fulfilment, OrderTotals } from '@/types'

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
      const unit = variant?.price ?? 0
      return {
        id: `ol-new-${i}`,
        productId: l.productId,
        productName: product?.name ?? '',
        variantId: variant?.id ?? l.variantId,
        size: variant?.size ?? 'M',
        toppings: [],
        qty: l.qty,
        unitPrice: unit,
        lineTotal: unit * l.qty,
      }
    })

    const linesSubtotal = lines.reduce((s, l) => s + l.lineTotal, 0)
    const fee = input.channel === 'delivery' ? 25000 : 0
    const tax = Math.round((linesSubtotal + fee) * 0.08)
    const grandTotal = linesSubtotal + fee + tax

    const fulfilment: Fulfilment =
      input.fulfilment.channel === 'delivery'
        ? { channel: 'delivery', addressId: input.fulfilment.addressId, fee }
        : input.fulfilment.channel === 'pickup'
          ? { channel: 'pickup', branchId: input.fulfilment.branchId, slot: input.fulfilment.slot }
          : { channel: 'dine-in', branchId: input.fulfilment.branchId, tableId: input.fulfilment.tableId }

    const totals: OrderTotals = {
      linesSubtotal,
      comboDiscount: 0,
      orderDiscount: 0,
      deliveryFee: fee,
      tax,
      loyaltyDiscount: 0,
      grandTotal,
      pointsToEarn: Math.round(grandTotal / 10000),
    }

    const maxNum = db.orders.reduce((m, o) => {
      const n = Number(o.code.replace('PF-', ''))
      return Number.isNaN(n) ? m : Math.max(m, n)
    }, 20440)
    const num = maxNum + 1
    const now = new Date().toISOString()

    const order: Order = {
      id: `ord-${num}`,
      code: `PF-${num}`,
      customerName: 'Khách vãng lai',
      channel: input.channel,
      status: 'created',
      lines,
      fulfilment,
      totals,
      paymentMethod: input.paymentMethod,
      paymentStatus: 'pending',
      appliedPromotions: [],
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
    if (body.status) o.status = body.status
    o.updatedAt = new Date().toISOString()
    persist()
    return HttpResponse.json(o)
  }),
]
