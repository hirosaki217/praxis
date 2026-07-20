import { http, HttpResponse } from 'msw'
import { getDB } from '../db'

export const miscHandlers = [
  http.get('/api/branches', () => HttpResponse.json(getDB().branches)),

  http.get('/api/customers', ({ request }) => {
    const url = new URL(request.url)
    const search = url.searchParams.get('search')?.toLowerCase()
    let items = getDB().customers
    if (search) {
      items = items.filter(
        (c) => c.name.toLowerCase().includes(search) || c.phone.replace(/\s/g, '').includes(search),
      )
    }
    return HttpResponse.json(items)
  }),
]
