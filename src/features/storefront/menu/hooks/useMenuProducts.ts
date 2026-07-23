import { useQuery } from '@tanstack/react-query'
import { getProducts, type GetProductsParams } from '@/lib/api/storefront'

export function useMenuProducts(params: GetProductsParams) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => getProducts(params),
  })
}
