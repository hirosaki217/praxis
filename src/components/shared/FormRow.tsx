import type { ReactNode } from 'react'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export interface FormRowProps {
  label: ReactNode
  children: ReactNode
  hint?: ReactNode
  error?: ReactNode
  htmlFor?: string
  required?: boolean
  className?: string
}

export function FormRow({
  label,
  children,
  hint,
  error,
  htmlFor,
  required = false,
  className,
}: FormRowProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={htmlFor}>
        <span>{label}</span>
        {required ? <span className='text-destructive'>*</span> : null}
      </Label>
      {children}
      {hint ? <p className='text-sm text-muted-foreground'>{hint}</p> : null}
      {error ? <p className='text-sm text-destructive'>{error}</p> : null}
    </div>
  )
}
