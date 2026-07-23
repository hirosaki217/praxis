import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Money } from '@/components/shared'
import type { Product } from '@/types'

export interface MenuProductCardProps {
  product: Product
  onQuickAdd: (product: Product) => void
}

export function MenuProductCard({ product, onQuickAdd }: MenuProductCardProps) {
  const basePrice = product.variants[0]?.price ?? 0

  return (
    <Card className='flex h-full flex-col p-4'>
      <div className='space-y-2'>
        <div className='flex items-start justify-between gap-3'>
          <div>
            <div className='font-medium'>{product.name}</div>
            <div className='text-sm text-muted-foreground'>{product.description || 'Pizza nóng giòn, chuẩn bị trong vài phút.'}</div>
          </div>
          {product.tags[0] ? (
            <span className='rounded-full bg-muted px-2 py-1 text-xs font-medium text-muted-foreground'>
              {product.tags[0]}
            </span>
          ) : null}
        </div>
        <div className='text-sm text-muted-foreground'>
          {product.variants.length} size · {product.toppings.length} topping tùy chọn
        </div>
      </div>

      <div className='mt-auto flex items-center justify-between gap-3 pt-4'>
        <div>
          <div className='text-xs text-muted-foreground'>Giá từ</div>
          <Money value={basePrice} className='text-base font-semibold text-foreground' />
        </div>
        <Button onClick={() => onQuickAdd(product)}>Quick add</Button>
      </div>
    </Card>
  )
}
