import { cn } from '@/lib/utils'
import type { Channel } from '@/types'

const META: Record<Channel, { label: string; icon: string; tone: string }> = {
  delivery: { label: 'Giao tận nơi', icon: '🛵', tone: 'bg-channel-delivery/10 text-channel-delivery' },
  pickup: { label: 'Tự đến lấy', icon: '🏪', tone: 'bg-channel-pickup/10 text-channel-pickup' },
  'dine-in': { label: 'Ăn tại quán', icon: '🍽️', tone: 'bg-channel-dinein/10 text-channel-dinein' },
}

export interface ChannelTagProps {
  channel: Channel
  size?: 'sm' | 'md'
  className?: string
}

/** Tag kênh đặt — màu cố định theo DESIGN_SYSTEM §7 (delivery/pickup/dine-in). */
export function ChannelTag({ channel, size = 'sm', className }: ChannelTagProps) {
  const m = META[channel]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm',
        m.tone,
        className,
      )}
    >
      <span aria-hidden>{m.icon}</span>
      {m.label}
    </span>
  )
}
