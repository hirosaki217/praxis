import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string
  description?: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-lg border border-dashed p-10 text-center',
        className,
      )}
    >
      <div className="text-3xl" aria-hidden>
        📭
      </div>
      <p className="mt-2 font-medium">{title}</p>
      {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  )
}

export function LoadingState({ label = 'Đang tải…', className }: { label?: string; className?: string }) {
  return (
    <div className={cn('flex items-center justify-center gap-2 p-10 text-sm text-muted-foreground', className)}>
      <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      {label}
    </div>
  )
}

export function ErrorState({
  title = 'Có lỗi xảy ra',
  description,
  onRetry,
  className,
}: {
  title?: string
  description?: string
  onRetry?: () => void
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-lg border border-destructive/30 bg-destructive/5 p-10 text-center',
        className,
      )}
    >
      <div className="text-3xl" aria-hidden>
        ⚠️
      </div>
      <p className="mt-2 font-medium text-destructive">{title}</p>
      {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-muted"
        >
          Thử lại
        </button>
      ) : null}
    </div>
  )
}
