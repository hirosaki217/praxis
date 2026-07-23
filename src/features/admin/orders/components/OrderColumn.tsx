import { cn } from '@/lib/utils'
import type { Order } from '@/types'
import type { OrderBoardGroup } from '../status-groups'
import { OrderCard } from './OrderCard'

export interface OrderColumnProps {
  group: OrderBoardGroup
  orders: Order[]
  onOpenDetail: (order: Order) => void
  onAdvance: (order: Order, nextStatus: Order['status']) => void
  updatingOrderId?: string
}

export function OrderColumn({ group, orders, onOpenDetail, onAdvance, updatingOrderId }: OrderColumnProps) {
  return (
    <section className='flex min-h-[280px] flex-col rounded-xl border bg-muted/20'>
      <div className='flex items-center justify-between border-b px-4 py-3'>
        <div className='font-medium'>{group.title}</div>
        <div className='rounded-full bg-background px-2 py-1 text-xs text-muted-foreground'>{orders.length}</div>
      </div>
      <div className={cn('flex flex-1 flex-col gap-3 p-4')}>
        {orders.length ? (
          orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onOpenDetail={onOpenDetail}
              onAdvance={onAdvance}
              isUpdating={updatingOrderId === order.id}
            />
          ))
        ) : (
          <div className='rounded-xl border border-dashed bg-background/60 p-4 text-sm text-muted-foreground'>
            Chưa có đơn trong nhóm này.
          </div>
        )}
      </div>
    </section>
  )
}
