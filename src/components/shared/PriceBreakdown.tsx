import type { ReactNode } from 'react'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { Money } from './Money'

export interface PriceBreakdownItem {
  label: ReactNode
  value: number
  className?: string
}

export interface PriceBreakdownProps {
  lines?: PriceBreakdownItem[]
  discounts?: PriceBreakdownItem[]
  fee?: number
  tax?: number
  total: number
  points?: number
  className?: string
}

export function PriceBreakdown({
  lines = [],
  discounts = [],
  fee = 0,
  tax = 0,
  total,
  points,
  className,
}: PriceBreakdownProps) {
  return (
    <div className={cn('rounded-xl border bg-card p-4', className)}>
      <div className='space-y-3 text-sm'>
        {lines.map((line) => (
          <BreakdownRow key={String(line.label)} label={line.label} value={line.value} className={line.className} />
        ))}

        {discounts.map((discount) => (
          <BreakdownRow
            key={String(discount.label)}
            label={discount.label}
            value={discount.value}
            className={cn('text-success', discount.className)}
            prefix='-'
          />
        ))}

        <BreakdownRow label='Phí giao hàng' value={fee} />
        <BreakdownRow label='VAT' value={tax} />

        <Separator />

        <div className='flex items-center justify-between gap-4 text-base font-semibold'>
          <span>Tổng thanh toán</span>
          <Money value={total} />
        </div>

        {typeof points === 'number' ? (
          <div className='text-sm text-muted-foreground'>+{points} điểm loyalty</div>
        ) : null}
      </div>
    </div>
  )
}

function BreakdownRow({
  label,
  value,
  className,
  prefix = '',
}: {
  label: ReactNode
  value: number
  className?: string
  prefix?: string
}) {
  return (
    <div className={cn('flex items-center justify-between gap-4 text-muted-foreground', className)}>
      <span>{label}</span>
      <span className='font-medium text-foreground'>
        {prefix}
        <Money value={value} />
      </span>
    </div>
  )
}
