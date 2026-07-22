import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface StatProps {
  label: ReactNode
  value: ReactNode
  meta?: ReactNode
  className?: string
}

export function Stat({ label, value, meta, className }: StatProps) {
  return (
    <div className={cn('space-y-1', className)}>
      <div className='text-sm text-muted-foreground'>{label}</div>
      <div className='text-lg font-semibold tracking-tight'>{value}</div>
      {meta ? <div className='text-xs text-muted-foreground'>{meta}</div> : null}
    </div>
  )
}
