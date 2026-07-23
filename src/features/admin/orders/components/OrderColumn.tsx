import { canTransition } from '@/lib/orders'
import { cn } from '@/lib/utils'
import type { Order } from '@/types'
import { STATUS_LABELS, type OrderBoardGroup } from '../status-groups'
import { OrderCard } from './OrderCard'

export interface OrderColumnProps {
  group: OrderBoardGroup
  orders: Order[]
  onOpenDetail: (order: Order) => void
  onAdvance: (order: Order, nextStatus: Order['status']) => void
  onDropToStatus: (status: Order['status']) => void
  onDragStart: (order: Order) => void
  onDragEnd: () => void
  draggedOrder: Order | null
  updatingOrderId?: string
}

export function OrderColumn({
  group,
  orders,
  onOpenDetail,
  onAdvance,
  onDropToStatus,
  onDragStart,
  onDragEnd,
  draggedOrder,
  updatingOrderId,
}: OrderColumnProps) {
  const legalTargets = draggedOrder
    ? group.statuses.filter((status) => canTransition(draggedOrder.channel, draggedOrder.status, status))
    : []

  return (
    <section className='flex min-h-[280px] flex-col rounded-xl border bg-muted/20'>
      <div className='flex items-center justify-between border-b px-4 py-3'>
        <div className='font-medium'>{group.title}</div>
        <div className='rounded-full bg-background px-2 py-1 text-xs text-muted-foreground'>{orders.length}</div>
      </div>
      <div className={cn('flex flex-1 flex-col gap-3 p-4')}>
        {legalTargets.length ? (
          <div className='grid gap-2'>
            {legalTargets.map((status) => (
              <button
                key={status}
                type='button'
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault()
                  onDropToStatus(status)
                }}
                className='rounded-xl border border-dashed bg-background/70 px-3 py-2 text-left text-xs font-medium text-primary'
              >
                Thả để chuyển sang {STATUS_LABELS[status]}
              </button>
            ))}
          </div>
        ) : null}

        {orders.length ? (
          orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onOpenDetail={onOpenDetail}
              onAdvance={onAdvance}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              isUpdating={updatingOrderId === order.id}
              isDragging={draggedOrder?.id === order.id}
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
