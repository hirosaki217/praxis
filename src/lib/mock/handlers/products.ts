import { http, HttpResponse } from 'msw'
import { getDB } from '../db'

export const productHandlers = [
  http.get('/api/categories', () => HttpResponse.json(getDB().categories)),

  http.get('/api/products', ({ request }) => {
    const url = new URL(request.url)
    const categoryId = url.searchParams.get('categoryId')
    const search = url.searchParams.get('search')?.toLowerCase()
    let items = getDB().products.filter((p) => p.available)
    if (categoryId) items = items.filter((p) => p.categoryId === categoryId)
    if (search) items = items.filter((p) => p.name.toLowerCase().includes(search))
    return HttpResponse.json(items)
  }),

  http.get('/api/products/:id', ({ params }) => {
    const id = params.id as string
    const p = getDB().products.find((x) => x.id === id)
    return p ? HttpResponse.json(p) : new HttpResponse(null, { status: 404 })
  }),
]
