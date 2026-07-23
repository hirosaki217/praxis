import { Link } from 'react-router-dom'
import { Trash2Icon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  ChannelTag,
  EmptyState,
  Money,
  PageHeader,
  PriceBreakdown,
  QuantityStepper,
  SegmentedControl,
} from '@/components/shared'
import { selectCartItemCount, selectCartTotals, useCartStore } from './cart.store'
import type { Channel } from '@/types'

const CHANNELS: { value: Channel; label: string }[] = [
  { value: 'delivery', label: '🛵 Giao' },
  { value: 'pickup', label: '🏪 Lấy' },
  { value: 'dine-in', label: '🍽️ Quán' },
]

export default function CartPage() {
  const lines = useCartStore((state) => state.lines)
  const channel = useCartStore((state) => state.channel)
  const updateQty = useCartStore((state) => state.updateQty)
  const removeLine = useCartStore((state) => state.removeLine)
  const setChannel = useCartStore((state) => state.setChannel)
  const totals = useCartStore(selectCartTotals)
  const itemCount = useCartStore(selectCartItemCount)

  return (
    <div className='mx-auto max-w-6xl space-y-6 p-6'>
      <PageHeader
        title='Giỏ hàng'
        subtitle={`Hiện có ${itemCount} món trong giỏ. Tiếp theo là nối voucher và checkout ở slice sau.`}
        actions={<ChannelTag channel={channel} size='md' />}
      />

      <SegmentedControl value={channel} onChange={setChannel} options={CHANNELS} />

      {!lines.length ? (
        <EmptyState
          title='Giỏ hàng đang trống'
          description='Quay lại menu để cấu hình món đầu tiên và thêm vào giỏ.'
          action={
            <Button asChild>
              <Link to='/'>Mở menu</Link>
            </Button>
          }
        />
      ) : (
        <div className='grid gap-4 lg:grid-cols-[1.5fr_1fr]'>
          <div className='space-y-4'>
            {lines.map((line) => (
              <div key={line.id} className='rounded-xl border bg-card p-4'>
                <div className='flex flex-wrap items-start justify-between gap-3'>
                  <div className='space-y-1'>
                    <div className='font-medium'>{line.productName}</div>
                    <div className='text-sm text-muted-foreground'>
                      Size {line.size}
                      {line.toppings.length
                        ? ` · ${line.toppings.map((topping: { name: string }) => topping.name).join(', ')}`
                        : ''}
                    </div>
                  </div>
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon-sm'
                    aria-label='Xóa món khỏi giỏ'
                    onClick={() => removeLine(line.id)}
                  >
                    <Trash2Icon className='size-4 text-muted-foreground' />
                  </Button>
                </div>

                <div className='mt-4 flex items-center justify-between gap-4'>
                  <QuantityStepper value={line.qty} onChange={(qty) => updateQty(line.id, qty)} min={1} />
                  <div className='text-right'>
                    <div className='text-xs text-muted-foreground'>Đơn giá</div>
                    <Money value={line.unitPrice} muted />
                    <div className='text-base font-semibold'>
                      <Money value={line.lineTotal} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <PriceBreakdown
            lines={[{ label: 'Tạm tính', value: totals.linesSubtotal }]}
            discounts={[]}
            fee={totals.deliveryFee}
            tax={totals.tax}
            total={totals.grandTotal}
            points={totals.pointsToEarn}
          />
        </div>
      )}
    </div>
  )
}
