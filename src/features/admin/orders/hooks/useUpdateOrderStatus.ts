import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { updateOrderStatus } from '@/lib/api/orders'

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateOrderStatus,
    onSuccess: (order) => {
      void queryClient.invalidateQueries({ queryKey: ['orders'] })
      void queryClient.invalidateQueries({ queryKey: ['orders', order.id] })
      toast.success(`Đã cập nhật ${order.code} sang trạng thái mới`)
    },
    onError: () => {
      toast.error('Không thể cập nhật trạng thái đơn hàng')
    },
  })
}
