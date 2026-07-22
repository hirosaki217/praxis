import { cn, formatCurrency } from '@/lib/utils'

export interface MoneyProps {
  value: number
  currency?: string
  locale?: string
  muted?: boolean
  className?: string
}

/** Hiện tiền tệ với tabular-nums (cột số thẳng hàng). */
export function Money({ value, currency = 'VND', locale = 'vi-VN', muted = false, className }: MoneyProps) {
  return <span className={cn('tabular-nums', muted && 'text-muted-foreground', className)}>{formatCurrency(value, currency, locale)}</span>
}
