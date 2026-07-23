import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ErrorState, LoadingState, PageHeader } from '@/components/shared'
import type { Channel, Order, PaymentStatus } from '@/types'
import { useAdminOrders } from './hooks/useAdminOrders'
import { useUpdateOrderStatus } from './hooks/useUpdateOrderStatus'
import { OrderBoard } from './components/OrderBoard'
import { OrderDetailDrawer } from './components/OrderDetailDrawer'
import { OrderFilters, type OrderFiltersState } from './components/OrderFilters'

function deriveDateRange(range: OrderFiltersState['dateRange']) {
  if (range === 'all') return {}

  const now = new Date()
  const from = new Date()

  if (range === 'today') {
    from.setHours(0, 0, 0, 0)
  }

  if (range === 'last7') {
    from.setDate(now.getDate() - 6)
    from.setHours(0, 0, 0, 0)
  }

  if (range === 'last30') {
    from.setDate(now.getDate() - 29)
    from.setHours(0, 0, 0, 0)
  }

  return {
    createdFrom: from.toISOString(),
    createdTo: now.toISOString(),
  }
}

export default function OrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const filters: OrderFiltersState = {
    channel: (searchParams.get('channel') as Channel | 'all') ?? 'all',
    paymentStatus: (searchParams.get('paymentStatus') as PaymentStatus | 'all') ?? 'all',
    search: searchParams.get('search') ?? '',
    dateRange: (searchParams.get('dateRange') as OrderFiltersState['dateRange']) ?? 'all',
  }

  const dateRange = deriveDateRange(filters.dateRange)
  const { data: orders = [], isLoading, isError, refetch } = useAdminOrders({
    channel: filters.channel === 'all' ? undefined : filters.channel,
    paymentStatus: filters.paymentStatus === 'all' ? undefined : filters.paymentStatus,
    search: filters.search || undefined,
    createdFrom: dateRange.createdFrom,
    createdTo: dateRange.createdTo,
  })
  const updateOrderStatus = useUpdateOrderStatus()

  const ordered = useMemo(
    () => [...orders].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    [orders],
  )

  const selectedOrder = ordered.find((order) => order.id === searchParams.get('selectedOrderId')) ?? null

  const handleFilterChange = (next: OrderFiltersState) => {
    const params = new URLSearchParams(searchParams)
    if (next.channel === 'all') params.delete('channel')
    else params.set('channel', next.channel)

    if (next.paymentStatus === 'all') params.delete('paymentStatus')
    else params.set('paymentStatus', next.paymentStatus)

    if (next.search) params.set('search', next.search)
    else params.delete('search')

    if (next.dateRange === 'all') params.delete('dateRange')
    else params.set('dateRange', next.dateRange)

    setSearchParams(params)
  }

  const handleAdvance = async (order: Order, nextStatus: Order['status']) => {
    const updated = await updateOrderStatus.mutateAsync({ id: order.id, status: nextStatus })
    if (selectedOrder?.id === order.id) {
      const params = new URLSearchParams(searchParams)
      params.set('selectedOrderId', updated.id)
      setSearchParams(params)
    }
  }

  return (
    <div className='space-y-6'>
      <PageHeader
        title='Order Board'
        subtitle='Theo dõi các đơn từ storefront theo nhóm trạng thái, lọc theo nhu cầu vận hành và cập nhật chúng theo state machine.'
      />

      <OrderFilters value={filters} onChange={handleFilterChange} />

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
          onOpenDetail={(order) => {
            const params = new URLSearchParams(searchParams)
            params.set('selectedOrderId', order.id)
            setSearchParams(params)
          }}
          onAdvance={handleAdvance}
          updatingOrderId={updateOrderStatus.variables?.id}
        />
      ) : null}

      <OrderDetailDrawer
        order={selectedOrder}
        open={Boolean(selectedOrder)}
        onOpenChange={(open) => {
          const params = new URLSearchParams(searchParams)
          if (!open) params.delete('selectedOrderId')
          setSearchParams(params)
        }}
        onAdvance={handleAdvance}
        isUpdating={updateOrderStatus.isPending}
      />
    </div>
  )
}
