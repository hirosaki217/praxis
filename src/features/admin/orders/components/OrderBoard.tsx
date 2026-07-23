import type { Order } from '@/types'
import { ORDER_BOARD_GROUPS, getOrderGroupKey } from '../status-groups'
import { OrderColumn } from './OrderColumn'

export interface OrderBoardProps {
  orders: Order[]
  onOpenDetail: (order: Order) => void
  onAdvance: (order: Order, nextStatus: Order['status']) => void
  updatingOrderId?: string
}

export function OrderBoard({ orders, onOpenDetail, onAdvance, updatingOrderId }: OrderBoardProps) {
  return (
    <div className='grid gap-4 xl:grid-cols-4'>
      {ORDER_BOARD_GROUPS.map((group) => (
        <OrderColumn
          key={group.key}
          group={group}
          orders={orders.filter((order) => getOrderGroupKey(order.status) === group.key)}
          onOpenDetail={onOpenDetail}
          onAdvance={onAdvance}
          updatingOrderId={updatingOrderId}
        />
      ))}
    </div>
  )
}
