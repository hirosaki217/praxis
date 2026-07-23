import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { ChannelTag, Money, OrderStepper, PriceBreakdown, StatusBadge } from '@/components/shared'
import { formatDateTime } from '@/lib/utils'
import { nextStatuses } from '@/lib/orders'
import type { Order } from '@/types'
import { STATUS_LABELS } from '../status-groups'

export interface OrderDetailDrawerProps {
  order: Order | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdvance: (order: Order, nextStatus: Order['status']) => void
  isUpdating: boolean
}

export function OrderDetailDrawer({ order, open, onOpenChange, onAdvance, isUpdating }: OrderDetailDrawerProps) {
  const next = order ? nextStatuses(order.channel, order.status)[0] : undefined

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side='right' className='w-full sm:max-w-xl'>
        {order ? (
          <>
            <SheetHeader>
              <div className='flex items-center gap-2'>
                <ChannelTag channel={order.channel} />
                <StatusBadge status={order.status} />
              </div>
              <SheetTitle>{order.code}</SheetTitle>
              <SheetDescription>
                {order.customerName}
                {order.customerPhone ? ` · ${order.customerPhone}` : ''}
              </SheetDescription>
            </SheetHeader>

            <div className='flex-1 space-y-4 overflow-y-auto px-4 pb-4'>
              <div className='rounded-xl border bg-card p-4 text-sm'>
                <div className='flex items-center justify-between gap-3'>
                  <span className='text-muted-foreground'>Tạo lúc</span>
                  <span>{formatDateTime(order.createdAt)}</span>
                </div>
                <div className='mt-2 flex items-center justify-between gap-3'>
                  <span className='text-muted-foreground'>Cập nhật gần nhất</span>
                  <span>{formatDateTime(order.updatedAt)}</span>
                </div>
                <div className='mt-2 flex items-center justify-between gap-3'>
                  <span className='text-muted-foreground'>Thanh toán</span>
                  <span>{order.paymentMethod.toUpperCase()}</span>
                </div>
              </div>

              <div className='rounded-xl border bg-card p-4'>
                <div className='mb-3 text-sm font-medium'>Món trong đơn</div>
                <div className='space-y-3'>
                  {order.lines.map((line) => (
                    <div key={line.id} className='flex items-start justify-between gap-3 text-sm'>
                      <div>
                        <div className='font-medium'>{line.productName}</div>
                        <div className='text-muted-foreground'>
                          {line.qty} × Size {line.size}
                          {line.toppings.length ? ` · ${line.toppings.map((topping) => topping.name).join(', ')}` : ''}
                        </div>
                      </div>
                      <Money value={line.lineTotal} className='font-medium' />
                    </div>
                  ))}
                </div>
              </div>

              <OrderStepper
                status={order.status}
                channel={order.channel}
                history={[{ status: order.status, at: order.updatedAt, note: `Khách: ${order.customerName}` }]}
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

              {next ? (
                <div className='flex justify-end'>
                  <Button type='button' onClick={() => onAdvance(order, next)} disabled={isUpdating}>
                    {isUpdating ? 'Đang cập nhật…' : `Chuyển sang ${STATUS_LABELS[next]}`}
                  </Button>
                </div>
              ) : null}
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
