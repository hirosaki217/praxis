import type { Branch, Category, Customer, Product } from '@/types'

export interface GetProductsParams {
  categoryId?: string
  search?: string
}

export class ApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function getCategories(): Promise<Category[]> {
  return requestJson<Category[]>('/api/categories')
}

export async function getBranches(): Promise<Branch[]> {
  return requestJson<Branch[]>('/api/branches')
}

export async function getProducts(params: GetProductsParams = {}): Promise<Product[]> {
  const searchParams = new URLSearchParams()

  if (params.categoryId) searchParams.set('categoryId', params.categoryId)
  if (params.search) searchParams.set('search', params.search)

  const query = searchParams.toString()
  return requestJson<Product[]>(query ? `/api/products?${query}` : '/api/products')
}

export async function getProduct(id: string): Promise<Product> {
  return requestJson<Product>(`/api/products/${id}`)
}

export async function getCustomers(): Promise<Customer[]> {
  return requestJson<Customer[]>('/api/customers')
}

async function requestJson<T>(input: string): Promise<T> {
  const response = await fetch(input)
  if (!response.ok) {
    throw new ApiError(`Request failed for ${input}`, response.status)
  }
  return (await response.json()) as T
}
