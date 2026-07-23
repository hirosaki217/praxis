import { useMemo, useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ErrorState, FilterBar, LoadingState, PageHeader } from '@/components/shared'
import type { Channel, Order } from '@/types'
import { useAdminOrders } from './hooks/useAdminOrders'
import { useUpdateOrderStatus } from './hooks/useUpdateOrderStatus'
import { OrderBoard } from './components/OrderBoard'
import { OrderDetailDrawer } from './components/OrderDetailDrawer'

const CHANNEL_OPTIONS: Array<{ value: Channel | 'all'; label: string }> = [
  { value: 'all', label: 'Tất cả kênh' },
  { value: 'delivery', label: 'Delivery' },
  { value: 'pickup', label: 'Pickup' },
  { value: 'dine-in', label: 'Dine-in' },
]

export default function OrdersPage() {
  const [channel, setChannel] = useState<Channel | 'all'>('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const { data: orders = [], isLoading, isError, refetch } = useAdminOrders({
    channel: channel === 'all' ? undefined : channel,
  })
  const updateOrderStatus = useUpdateOrderStatus()

  const ordered = useMemo(
    () => [...orders].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    [orders],
  )

  const handleAdvance = async (order: Order, nextStatus: Order['status']) => {
    const updated = await updateOrderStatus.mutateAsync({ id: order.id, status: nextStatus })
    if (selectedOrder?.id === order.id) setSelectedOrder(updated)
  }

  return (
    <div className='space-y-6'>
      <PageHeader
        title='Order Board'
        subtitle='Theo dõi các đơn từ storefront theo nhóm trạng thái và cập nhật chúng theo state machine.'
      />

      <FilterBar>
        <Select value={channel} onValueChange={(value: string) => setChannel(value as Channel | 'all')}>
          <SelectTrigger className='w-full sm:w-52'>
            <SelectValue placeholder='Lọc theo kênh' />
          </SelectTrigger>
          <SelectContent>
            {CHANNEL_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterBar>

      {isLoading ? <LoadingState className='rounded-xl border p-10' label='Đang tải order board…' /> : null}
      {isError ? (
        <ErrorState
          title='Không tải được order board'
          description='Vui lòng thử lại để lấy danh sách đơn mới nhất.'
          onRetry={() => void refetch()}
        />
      ) : null}
      {!isLoading && !isError ? (
        <OrderBoard
          orders={ordered}
          onOpenDetail={setSelectedOrder}
          onAdvance={handleAdvance}
          updatingOrderId={updateOrderStatus.variables?.id}
        />
      ) : null}

      <OrderDetailDrawer
        order={selectedOrder}
        open={Boolean(selectedOrder)}
        onOpenChange={(open) => {
          if (!open) setSelectedOrder(null)
        }}
        onAdvance={handleAdvance}
        isUpdating={updateOrderStatus.isPending}
      />
    </div>
  )
}
