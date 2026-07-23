import { useQuery } from '@tanstack/react-query'
import { getOrderById } from '@/lib/api/orders'
import { isTerminal } from '@/lib/orders'

export function useTrackingOrder(orderId: string | undefined) {
  return useQuery({
    queryKey: ['orders', orderId],
    queryFn: () => getOrderById(orderId!),
    enabled: Boolean(orderId),
    refetchInterval: (query) => {
      const order = query.state.data
      if (!order) return 5000
      return isTerminal(order.status) ? false : 5000
    },
  })
}
