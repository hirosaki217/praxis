import { useParams } from 'react-router-dom'
import { EmptyState, ErrorState, LoadingState, OrderStepper, PageHeader, PriceBreakdown, StatusBadge } from '@/components/shared'
import { useTrackingOrder } from './hooks/useTrackingOrder'

export default function TrackingPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const { data: order, isLoading, isError, refetch } = useTrackingOrder(orderId)

  if (isLoading) {
    return <LoadingState className='p-10' label='Đang tải trạng thái đơn hàng…' />
  }

  if (isError) {
    return (
      <div className='mx-auto max-w-5xl p-6'>
        <ErrorState
          title='Không tải được đơn hàng'
          description='Vui lòng thử lại hoặc kiểm tra lại mã đơn.'
          onRetry={() => void refetch()}
        />
      </div>
    )
  }

  if (!order) {
    return (
      <div className='mx-auto max-w-5xl p-6'>
        <EmptyState title='Không tìm thấy đơn hàng' description='Mã đơn không tồn tại hoặc đã bị xóa.' />
      </div>
    )
  }

  return (
    <div className='mx-auto max-w-6xl space-y-6 p-6'>
      <PageHeader
        title={`Theo dõi đơn ${order.code}`}
        subtitle='Trang này tự làm mới định kỳ cho đến khi đơn hoàn tất hoặc bị hủy.'
        actions={<StatusBadge status={order.status} />}
      />

      <div className='grid gap-4 lg:grid-cols-[1.4fr_1fr]'>
        <OrderStepper
          status={order.status}
          channel={order.channel}
          history={[{ status: order.status, at: order.updatedAt, note: `Khách hàng: ${order.customerName}` }]}
        />
        <PriceBreakdown
          lines={[{ label: 'Tạm tính', value: order.totals.linesSubtotal }]}
          discounts={[
            { label: 'Combo discount', value: order.totals.comboDiscount },
            { label: 'Order discount', value: order.totals.orderDiscount },
          ].filter((item) => item.value > 0)}
          fee={order.totals.deliveryFee}
          tax={order.totals.tax}
          total={order.totals.grandTotal}
          points={order.totals.pointsToEarn}
        />
      </div>
    </div>
  )
}
