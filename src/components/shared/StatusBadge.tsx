import { cn } from '@/lib/utils'
import type { OrderStatus, PaymentStatus } from '@/types'

type StatusKind = 'order' | 'payment' | 'customer' | 'inventory' | 'product'
type SupportedStatus =
  | OrderStatus
  | PaymentStatus
  | 'active'
  | 'blacklist'
  | 'in_stock'
  | 'low_stock'
  | 'out_of_stock'
  | 'available'
  | 'hidden'

const META: Record<StatusKind, Record<string, { label: string; tone: string }>> = {
  order: {
    created: { label: 'Mới', tone: 'bg-info/10 text-info' },
    confirmed: { label: 'Đã xác nhận', tone: 'bg-info/10 text-info' },
    preparing: { label: 'Đang làm', tone: 'bg-warning/10 text-warning' },
    ready: { label: 'Sẵn sàng', tone: 'bg-warning/10 text-warning' },
    ready_for_pickup: { label: 'Sẵn sàng lấy', tone: 'bg-warning/10 text-warning' },
    assigned_driver: { label: 'Đã giao shipper', tone: 'bg-primary/10 text-primary' },
    out_for_delivery: { label: 'Đang giao', tone: 'bg-primary/10 text-primary' },
    served: { label: 'Đã phục vụ', tone: 'bg-success/10 text-success' },
    delivered: { label: 'Đã giao', tone: 'bg-success/10 text-success' },
    picked_up: { label: 'Đã lấy', tone: 'bg-success/10 text-success' },
    completed: { label: 'Hoàn tất', tone: 'bg-success/15 text-success' },
    cancelled: { label: 'Đã hủy', tone: 'bg-destructive/10 text-destructive' },
    refunded: { label: 'Đã hoàn tiền', tone: 'bg-muted text-muted-foreground' },
  },
  payment: {
    pending: { label: 'Chờ thanh toán', tone: 'bg-warning/10 text-warning' },
    paid: { label: 'Đã thanh toán', tone: 'bg-success/10 text-success' },
    failed: { label: 'Thanh toán lỗi', tone: 'bg-destructive/10 text-destructive' },
    refunded: { label: 'Hoàn tiền', tone: 'bg-muted text-muted-foreground' },
  },
  customer: {
    active: { label: 'Hoạt động', tone: 'bg-success/10 text-success' },
    blacklist: { label: 'Blacklist', tone: 'bg-destructive/10 text-destructive' },
  },
  inventory: {
    in_stock: { label: 'Đủ hàng', tone: 'bg-success/10 text-success' },
    low_stock: { label: 'Sắp hết', tone: 'bg-warning/10 text-warning' },
    out_of_stock: { label: 'Hết hàng', tone: 'bg-destructive/10 text-destructive' },
  },
  product: {
    available: { label: 'Đang bán', tone: 'bg-success/10 text-success' },
    hidden: { label: 'Đã ẩn', tone: 'bg-muted text-muted-foreground' },
  },
}

export interface StatusBadgeProps {
  status: SupportedStatus
  kind?: StatusKind
  className?: string
}

/** Badge trạng thái nghiệp vụ — ánh xạ theo DESIGN_SYSTEM §7. */
export function StatusBadge({ status, kind = 'order', className }: StatusBadgeProps) {
  const meta = META[kind][status] ?? { label: status, tone: 'bg-muted text-muted-foreground' }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        meta.tone,
        className,
      )}
    >
      {meta.label}
    </span>
  )
}
