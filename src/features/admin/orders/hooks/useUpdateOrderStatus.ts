import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { updateOrderStatus, type GetOrdersParams } from '@/lib/api/orders'
import type { Order } from '@/types'

function matchesFilter(order: Order, params: GetOrdersParams | undefined) {
  if (!params) return true
  if (params.channel && order.channel !== params.channel) return false
  if (params.status && order.status !== params.status) return false
  if (params.paymentStatus && order.paymentStatus !== params.paymentStatus) return false
  if (params.search) {
    const search = params.search.toLowerCase()
    const normalizedSearch = search.replace(/\s/g, '')
    const normalizedPhone = order.customerPhone?.replace(/\s/g, '') ?? ''
    if (
      !order.code.toLowerCase().includes(search) &&
      !order.customerName.toLowerCase().includes(search) &&
      !normalizedPhone.includes(normalizedSearch)
    ) {
      return false
    }
  }
  if (params.createdFrom && new Date(order.createdAt).getTime() < new Date(params.createdFrom).getTime()) {
    return false
  }
  if (params.createdTo && new Date(order.createdAt).getTime() > new Date(params.createdTo).getTime()) {
    return false
  }
  return true
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateOrderStatus,
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: ['orders'] })
      const snapshots = queryClient.getQueriesData<Order[]>({ queryKey: ['orders'] })

      snapshots.forEach(([queryKey, orders]) => {
        if (!orders) return
        const params = queryKey[1] as GetOrdersParams | undefined
        const nextOrders = orders
          .map((order) => (order.id === input.id ? { ...order, status: input.status, updatedAt: new Date().toISOString() } : order))
          .filter((order) => matchesFilter(order, params))

        queryClient.setQueryData(queryKey, nextOrders)
      })

      return { snapshots }
    },
    onSuccess: (order) => {
      void queryClient.invalidateQueries({ queryKey: ['orders'] })
      void queryClient.invalidateQueries({ queryKey: ['orders', order.id] })
      toast.success(`Đã cập nhật ${order.code} sang trạng thái mới`)
    },
    onError: (_, __, context) => {
      context?.snapshots.forEach(([queryKey, orders]) => {
        queryClient.setQueryData(queryKey, orders)
      })
      toast.error('Không thể cập nhật trạng thái đơn hàng')
    },
  })
}
