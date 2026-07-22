import type { Channel, OrderStatus } from '@/types'

/**
 * Máy trạng thái đơn hàng — transition hợp lệ KHÁC theo kênh:
 *   delivery : created→confirmed→preparing→ready→assigned_driver→out_for_delivery→delivered→completed
 *   pickup   : created→confirmed→preparing→ready_for_pickup→picked_up→completed
 *   dine-in  : created→confirmed→preparing→served→completed
 * Mọi kênh có thể → cancelled ở các giai đoạn sớm.
 */
const TRANSITIONS: Record<Channel, Partial<Record<OrderStatus, OrderStatus[]>>> = {
  delivery: {
    created: ['confirmed', 'cancelled'],
    confirmed: ['preparing', 'cancelled'],
    preparing: ['ready', 'cancelled'],
    ready: ['assigned_driver', 'cancelled'],
    assigned_driver: ['out_for_delivery', 'cancelled'],
    out_for_delivery: ['delivered', 'cancelled'],
    delivered: ['completed'],
  },
  pickup: {
    created: ['confirmed', 'cancelled'],
    confirmed: ['preparing', 'cancelled'],
    preparing: ['ready_for_pickup', 'cancelled'],
    ready_for_pickup: ['picked_up', 'cancelled'],
    picked_up: ['completed'],
  },
  'dine-in': {
    created: ['confirmed', 'cancelled'],
    confirmed: ['preparing', 'cancelled'],
    preparing: ['served', 'cancelled'],
    served: ['completed'],
  },
}

const TERMINAL: OrderStatus[] = ['completed', 'cancelled', 'refunded']

export function canTransition(channel: Channel, from: OrderStatus, to: OrderStatus): boolean {
  if (from === to) return false
  return TRANSITIONS[channel]?.[from]?.includes(to) ?? false
}

export function nextStatuses(channel: Channel, from: OrderStatus): OrderStatus[] {
  return TRANSITIONS[channel]?.[from] ?? []
}

export function isTerminal(status: OrderStatus): boolean {
  return TERMINAL.includes(status)
}

/** Thực hiện transition; throw nếu bất hợp lệ. */
export function transition(channel: Channel, from: OrderStatus, to: OrderStatus): OrderStatus {
  if (!canTransition(channel, from, to)) {
    throw new Error(`Invalid order transition: ${from} → ${to} (channel: ${channel})`)
  }
  return to
}

/**
 * Policy hoàn tiền theo giai đoạn khi hủy (0..1):
 *  - trước "preparing": hoàn 100%
 *  - preparing/ready/ready_for_pickup/assigned_driver: hoàn 50%
 *  - sau đó: 0%
 */
export function refundFraction(channel: Channel, fromStatus: OrderStatus): number {
  void channel // policy giống nhau giữa các kênh (giữ param cho future)
  if (fromStatus === 'created' || fromStatus === 'confirmed') return 1
  if (
    fromStatus === 'preparing' ||
    fromStatus === 'ready' ||
    fromStatus === 'ready_for_pickup' ||
    fromStatus === 'assigned_driver'
  ) {
    return 0.5
  }
  return 0
}
