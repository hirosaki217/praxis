import { useQuery } from '@tanstack/react-query'
import { FeaturePlaceholder, OrderStepper, PriceBreakdown } from '@/components/shared'
import type { Order } from '@/types'

export default function TrackingPage() {
  const { data } = useQuery({
    queryKey: ['orders', 'tracking-demo'],
    queryFn: async () => (await fetch('/api/orders').then((response) => response.json())) as Order[],
  })

  const order = data?.[0]

  return (
    <FeaturePlaceholder
      title='Theo dõi đơn hàng'
      subtitle='Skeleton route cho tracking trước khi bật polling state-machine thật.'
      description='Phase 5 sẽ poll /api/orders/:id và hiển thị timeline cập nhật realtime.'
    >
      {order ? (
        <div className='grid gap-4 lg:grid-cols-[1.4fr_1fr]'>
          <OrderStepper
            status={order.status}
            channel={order.channel}
            history={[{ status: order.status, at: order.updatedAt, note: `Đơn ${order.code}` }]}
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
      ) : null}
    </FeaturePlaceholder>
  )
}
