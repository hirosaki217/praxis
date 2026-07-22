import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface FilterBarProps {
  children: ReactNode
  actions?: ReactNode
  className?: string
}

export function FilterBar({ children, actions, className }: FilterBarProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between',
        className,
      )}
    >
      <div className='flex flex-1 flex-wrap items-center gap-3'>{children}</div>
      {actions ? <div className='flex items-center gap-2'>{actions}</div> : null}
    </div>
  )
}
