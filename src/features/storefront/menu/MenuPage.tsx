import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card } from '@/components/ui/card'
import {
  ChannelTag,
  ConfirmDialog,
  Money,
  PageHeader,
  SegmentedControl,
  StatusBadge,
} from '@/components/shared'
import { Button } from '@/components/ui/button'
import type { Channel, OrderStatus, Product } from '@/types'

const CHANNELS: { value: Channel; label: string }[] = [
  { value: 'delivery', label: '🛵 Giao' },
  { value: 'pickup', label: '🏪 Lấy' },
  { value: 'dine-in', label: '🍽️ Quán' },
]

export default function MenuPage() {
  const [channel, setChannel] = useState<Channel>('delivery')
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => (await fetch('/api/products').then((r) => r.json())) as Product[],
  })

  const statuses: OrderStatus[] = ['created', 'preparing', 'out_for_delivery', 'completed', 'cancelled']

  return (
    <div className='mx-auto max-w-5xl space-y-6 p-6'>
      <PageHeader
        title='🍕 PizzaForge'
        subtitle='P4a — demo nền UI + data stack (React Query + MSW)'
        actions={
          <ConfirmDialog
            trigger={<Button variant='outline'>Reset demo</Button>}
            title='Reset demo data?'
            description='Phase 4 chỉ mới dựng shell + shared components; bước sau sẽ nối reset thật với seed data.'
            confirmLabel='Đã hiểu'
          />
        }
      />

      <div className='flex flex-wrap items-center gap-3'>
        <SegmentedControl value={channel} onChange={setChannel} options={CHANNELS} />
        <ChannelTag channel={channel} size='md' />
      </div>

      <div className='flex flex-wrap gap-2'>
        {statuses.map((s) => (
          <StatusBadge key={s} status={s} />
        ))}
      </div>

      <p className='text-sm text-muted-foreground'>
        Sản phẩm: {isLoading ? '…' : products.length} · giá đầu:{' '}
        {products[0] ? (
          <Money value={products[0].variants[0]?.price ?? 0} className='font-semibold text-foreground' />
        ) : (
          '—'
        )}
      </p>

      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        {products.slice(0, 6).map((p) => (
          <Card key={p.id} className='p-4'>
            <div className='font-medium'>{p.name}</div>
            <div className='mt-1 text-sm text-muted-foreground'>
              từ <Money value={p.variants[0]?.price ?? 0} className='font-semibold text-foreground' />
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
