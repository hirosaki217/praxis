import type { ReactNode } from 'react'
import type { Channel, OrderStatus } from '@/types'
import { cn, formatDateTime } from '@/lib/utils'
import { StatusBadge } from './StatusBadge'

const FLOW: Record<Channel, OrderStatus[]> = {
  delivery: ['created', 'confirmed', 'preparing', 'ready', 'assigned_driver', 'out_for_delivery', 'delivered', 'completed'],
  pickup: ['created', 'confirmed', 'preparing', 'ready_for_pickup', 'picked_up', 'completed'],
  'dine-in': ['created', 'confirmed', 'preparing', 'served', 'completed'],
}

const LABEL: Record<OrderStatus, string> = {
  created: 'Mới',
  confirmed: 'Xác nhận',
  preparing: 'Đang làm',
  ready: 'Sẵn sàng',
  ready_for_pickup: 'Chờ lấy',
  assigned_driver: 'Giao shipper',
  out_for_delivery: 'Đang giao',
  served: 'Đã phục vụ',
  delivered: 'Đã giao',
  picked_up: 'Đã lấy',
  completed: 'Hoàn tất',
  cancelled: 'Đã hủy',
  refunded: 'Hoàn tiền',
}

export interface OrderHistoryItem {
  status: OrderStatus
  at?: string
  note?: ReactNode
}

export interface OrderStepperProps {
  status: OrderStatus
  channel: Channel
  history?: OrderHistoryItem[]
  className?: string
}

export function OrderStepper({ status, channel, history = [], className }: OrderStepperProps) {
  const flow = FLOW[channel]
  const activeIndex = Math.max(0, flow.indexOf(status))
  const isInterrupted = status === 'cancelled' || status === 'refunded'

  return (
    <div className={cn('space-y-4 rounded-xl border bg-card p-4', className)}>
      <div className='flex items-center justify-between gap-3'>
        <div>
          <div className='text-sm font-medium'>Tiến trình đơn hàng</div>
          <div className='text-sm text-muted-foreground'>Kênh {channel}</div>
        </div>
        <StatusBadge status={status} />
      </div>

      <ol className='grid gap-3 md:grid-cols-[repeat(auto-fit,minmax(0,1fr))]'>
        {flow.map((step, index) => {
          const isDone = index <= activeIndex && !isInterrupted
          const isCurrent = step === status
          const historyItem = history.find((item) => item.status === step)

          return (
            <li key={step} className='flex items-start gap-3'>
              <div
                className={cn(
                  'mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold',
                  isCurrent && 'border-primary bg-primary text-primary-foreground',
                  !isCurrent && isDone && 'border-success bg-success/10 text-success',
                  !isCurrent && !isDone && 'border-border bg-muted text-muted-foreground',
                )}
              >
                {index + 1}
              </div>
              <div className='min-w-0'>
                <div className={cn('text-sm font-medium', isCurrent ? 'text-foreground' : 'text-muted-foreground')}>
                  {LABEL[step]}
                </div>
                {historyItem?.at ? (
                  <div className='text-xs text-muted-foreground'>{formatDateTime(historyItem.at)}</div>
                ) : null}
                {historyItem?.note ? <div className='text-xs text-muted-foreground'>{historyItem.note}</div> : null}
              </div>
            </li>
          )
        })}
      </ol>

      {isInterrupted ? (
        <div className='rounded-lg bg-destructive/5 p-3 text-sm text-destructive'>
          Đơn đã dừng ở trạng thái <strong>{LABEL[status]}</strong>.
        </div>
      ) : null}
    </div>
  )
}
