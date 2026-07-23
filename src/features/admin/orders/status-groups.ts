import type { OrderStatus } from '@/types'

export interface OrderBoardGroup {
  key: 'new' | 'preparing' | 'fulfillment' | 'done'
  title: string
  statuses: OrderStatus[]
}

export const STATUS_LABELS: Record<OrderStatus, string> = {
  created: 'Mới',
  confirmed: 'Đã xác nhận',
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

export const ORDER_BOARD_GROUPS: OrderBoardGroup[] = [
  {
    key: 'new',
    title: 'Mới',
    statuses: ['created', 'confirmed'],
  },
  {
    key: 'preparing',
    title: 'Đang làm',
    statuses: ['preparing', 'ready', 'served'],
  },
  {
    key: 'fulfillment',
    title: 'Đang giao / chờ lấy',
    statuses: ['assigned_driver', 'out_for_delivery', 'ready_for_pickup', 'picked_up', 'delivered'],
  },
  {
    key: 'done',
    title: 'Hoàn tất / đã dừng',
    statuses: ['completed', 'cancelled', 'refunded'],
  },
]

export function getOrderGroupKey(status: OrderStatus): OrderBoardGroup['key'] {
  return ORDER_BOARD_GROUPS.find((group) => group.statuses.includes(status))?.key ?? 'new'
}
