import { Button } from '@/components/ui/button'
import { ChannelTag, Money, StatusBadge } from '@/components/shared'
import { formatDateTime } from '@/lib/utils'
import { nextStatuses } from '@/lib/orders'
import type { Order } from '@/types'
import { STATUS_LABELS } from '../status-groups'

export interface OrderCardProps {
  order: Order
  onOpenDetail: (order: Order) => void
  onAdvance: (order: Order, nextStatus: Order['status']) => void
  isUpdating: boolean
}

export function OrderCard({ order, onOpenDetail, onAdvance, isUpdating }: OrderCardProps) {
  const next = nextStatuses(order.channel, order.status)[0]

  return (
    <div className='space-y-3 rounded-xl border bg-card p-4'>
      <div className='flex items-start justify-between gap-3'>
        <div>
          <div className='font-mono text-sm font-semibold'>{order.code}</div>
          <div className='text-sm font-medium'>{order.customerName}</div>
          {order.customerPhone ? <div className='text-xs text-muted-foreground'>{order.customerPhone}</div> : null}
        </div>
        <ChannelTag channel={order.channel} />
      </div>

      <div className='flex items-center justify-between gap-3'>
        <StatusBadge status={order.status} />
        <Money value={order.totals.grandTotal} className='font-semibold' />
      </div>

      <div className='text-xs text-muted-foreground'>Cập nhật: {formatDateTime(order.updatedAt)}</div>

      <div className='flex flex-wrap gap-2'>
        <Button type='button' variant='outline' size='sm' onClick={() => onOpenDetail(order)}>
          Chi tiết
        </Button>
        {next ? (
          <Button
            type='button'
            size='sm'
            onClick={() => onAdvance(order, next)}
            disabled={isUpdating}
          >
            {isUpdating ? 'Đang cập nhật…' : `Chuyển sang ${STATUS_LABELS[next]}`}
          </Button>
        ) : null}
      </div>
    </div>
  )
}
