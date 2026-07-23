import { useQuery } from '@tanstack/react-query'
import { getOrders, type GetOrdersParams } from '@/lib/api/orders'

export function useAdminOrders(params: GetOrdersParams) {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: () => getOrders(params),
  })
}
