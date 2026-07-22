import { Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export interface QuantityStepperProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  className?: string
}

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = Number.MAX_SAFE_INTEGER,
  className,
}: QuantityStepperProps) {
  const decrement = () => onChange(Math.max(min, value - 1))
  const increment = () => onChange(Math.min(max, value + 1))

  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <Button
        type='button'
        size='icon-sm'
        variant='outline'
        aria-label='Giảm số lượng'
        onClick={decrement}
        disabled={value <= min}
      >
        <Minus className='size-3.5' />
      </Button>
      <Input
        value={String(value)}
        readOnly
        aria-label='Số lượng'
        className='w-14 text-center tabular-nums'
      />
      <Button
        type='button'
        size='icon-sm'
        variant='outline'
        aria-label='Tăng số lượng'
        onClick={increment}
        disabled={value >= max}
      >
        <Plus className='size-3.5' />
      </Button>
    </div>
  )
}
