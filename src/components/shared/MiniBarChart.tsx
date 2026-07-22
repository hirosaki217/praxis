import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { cn, formatCurrency } from '@/lib/utils'

export interface MiniBarDatum {
  label: string
  value: number
  highlight?: boolean
}

export interface MiniBarChartProps {
  data: MiniBarDatum[]
  className?: string
  height?: number
  formatValue?: (value: number) => string
  ariaLabel?: string
}

export function MiniBarChart({
  data,
  className,
  height = 220,
  formatValue = (value) => formatCurrency(value),
  ariaLabel = 'Biểu đồ cột thu nhỏ',
}: MiniBarChartProps) {
  return (
    <div className={cn('h-full w-full', className)} role='img' aria-label={ariaLabel}>
      <ResponsiveContainer width='100%' height={height}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
          <XAxis
            dataKey='label'
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          />
          <YAxis hide />
          <Tooltip
            cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
            formatter={(value: number | string | ReadonlyArray<number | string> | undefined) => {
              const normalized = Array.isArray(value) ? value[0] : value
              return formatValue(Number(normalized ?? 0))
            }}
            contentStyle={{
              borderRadius: 12,
              border: '1px solid hsl(var(--border))',
              background: 'hsl(var(--popover))',
              color: 'hsl(var(--popover-foreground))',
            }}
          />
          <Bar dataKey='value' radius={[8, 8, 2, 2]}>
            {data.map((item) => (
              <Cell
                key={item.label}
                fill={item.highlight ? 'hsl(var(--primary))' : 'color-mix(in oklch, hsl(var(--muted-foreground)) 25%, transparent)'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
