import { http, HttpResponse } from 'msw'
import { getDB } from '../db'

export const promotionHandlers = [
  http.get('/api/promotions', () => HttpResponse.json(getDB().promotions.filter((p) => p.active))),

  http.post('/api/promotions/validate', async ({ request }) => {
    const body = (await request.json()) as { code?: string; orderTotal?: number }
    const promo = getDB().promotions.find(
      (p) => p.code === body.code?.toUpperCase() && p.active,
    )
    if (!promo) {
      return HttpResponse.json({ valid: false, message: 'Mã không hợp lệ hoặc hết hạn' }, { status: 404 })
    }

    // tính giảm đơn giản (P3 sẽ dùng pricing engine)
    let discount = 0
    const total = body.orderTotal ?? 0
    if (promo.type === 'percent') {
      discount = Math.min(Math.round((total * promo.value) / 100), promo.conditions.maxDiscount ?? Infinity)
    } else if (promo.type === 'fixed') {
      discount = promo.value
    }

    return HttpResponse.json({ valid: true, promotion: promo, discount })
  }),
]
