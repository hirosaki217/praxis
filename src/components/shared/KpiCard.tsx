import type { ReactNode } from 'react'
import { TrendingDown, TrendingUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface KpiCardProps {
  label: ReactNode
  value: ReactNode
  delta?: ReactNode
  trend?: 'up' | 'down' | 'neutral'
  className?: string
}

export function KpiCard({ label, value, delta, trend = 'neutral', className }: KpiCardProps) {
  return (
    <Card className={cn('py-0', className)}>
      <CardContent className='flex items-start justify-between gap-4 p-4'>
        <div className='space-y-1'>
          <p className='text-sm text-muted-foreground'>{label}</p>
          <div className='text-2xl font-bold tracking-tight'>{value}</div>
        </div>
        {delta ? (
          <Badge variant='outline' className='gap-1 rounded-full'>
            {trend === 'up' ? <TrendingUp className='size-3 text-success' /> : null}
            {trend === 'down' ? <TrendingDown className='size-3 text-destructive' /> : null}
            {delta}
          </Badge>
        ) : null}
      </CardContent>
    </Card>
  )
}
