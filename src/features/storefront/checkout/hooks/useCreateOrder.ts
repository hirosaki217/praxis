import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { createOrder } from '@/lib/api/orders'

export function useCreateOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createOrder,
    onSuccess: (order) => {
      void queryClient.invalidateQueries({ queryKey: ['orders'] })
      void queryClient.invalidateQueries({ queryKey: ['orders', order.id] })
      toast.success(`Đã tạo đơn ${order.code}`)
    },
    onError: () => {
      toast.error('Không thể tạo đơn. Vui lòng thử lại.')
    },
  })
}
