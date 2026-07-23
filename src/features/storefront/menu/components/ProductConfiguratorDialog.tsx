import { useEffect, useMemo, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Money, QuantityStepper } from '@/components/shared'
import { lineUnitPrice } from '@/lib/pricing'
import type { Channel, Product, ProductVariant } from '@/types'
import { useCartStore } from '@/features/storefront/cart/cart.store'

export interface ProductConfiguratorDialogProps {
  product: Product | null
  channel: Channel
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProductConfiguratorDialog({ product, channel, open, onOpenChange }: ProductConfiguratorDialogProps) {
  const addLine = useCartStore((state) => state.addLine)
  const setChannel = useCartStore((state) => state.setChannel)
  const [selectedVariantId, setSelectedVariantId] = useState<string>('')
  const [selectedToppingIds, setSelectedToppingIds] = useState<string[]>([])
  const [qty, setQty] = useState(1)

  const selectedVariant = useMemo<ProductVariant | null>(() => {
    if (!product) return null
    return product.variants.find((variant) => variant.id === selectedVariantId) ?? product.variants[0] ?? null
  }, [product, selectedVariantId])

  const unitPrice = useMemo(() => {
    if (!product || !selectedVariant) return 0
    return lineUnitPrice(selectedVariant, product.toppings, selectedToppingIds, selectedVariant.size)
  }, [product, selectedToppingIds, selectedVariant])

  useEffect(() => {
    if (!product) return
    const firstVariant = product.variants[0]
    setSelectedVariantId(firstVariant?.id ?? '')
    setSelectedToppingIds([])
    setQty(1)
  }, [product])

  const handleToggleTopping = (toppingId: string, checked: boolean) => {
    setSelectedToppingIds((current) =>
      checked ? [...current, toppingId] : current.filter((id) => id !== toppingId),
    )
  }

  const handleConfirm = () => {
    if (!product || !selectedVariant) return

    setChannel(channel)
    addLine({
      product,
      variant: selectedVariant,
      qty,
      selectedToppings: product.toppings.filter((topping) => selectedToppingIds.includes(topping.id)),
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>{product?.name ?? 'Tùy chọn món'}</DialogTitle>
          <DialogDescription>
            {product?.description ?? 'Chọn size, topping và số lượng trước khi thêm vào giỏ.'}
          </DialogDescription>
        </DialogHeader>

        {product && selectedVariant ? (
          <div className='space-y-5'>
            <section className='space-y-3'>
              <div className='text-sm font-medium'>Chọn size</div>
              <div className='grid gap-2 sm:grid-cols-2'>
                {product.variants.map((variant) => (
                  <button
                    key={variant.id}
                    type='button'
                    onClick={() => setSelectedVariantId(variant.id)}
                    className={[
                      'rounded-xl border p-3 text-left transition-colors',
                      variant.id === selectedVariant.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:bg-muted/50',
                    ].join(' ')}
                  >
                    <div className='font-medium'>Size {variant.size}</div>
                    <Money value={variant.price} className='text-sm text-muted-foreground' />
                  </button>
                ))}
              </div>
            </section>

            <section className='space-y-3'>
              <div className='text-sm font-medium'>Thêm topping</div>
              <div className='space-y-2'>
                {product.toppings.map((topping) => {
                  const checked = selectedToppingIds.includes(topping.id)
                  return (
                    <label
                      key={topping.id}
                      className='flex items-center justify-between gap-3 rounded-xl border p-3 text-sm'
                    >
                      <div className='flex items-center gap-3'>
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(value: boolean | 'indeterminate') =>
                            handleToggleTopping(topping.id, value === true)
                          }
                        />
                        <span>{topping.name}</span>
                      </div>
                      <Money value={topping.priceBySize[selectedVariant.size] ?? 0} muted />
                    </label>
                  )
                })}
              </div>
            </section>

            <section className='flex items-center justify-between gap-4 rounded-xl border bg-muted/30 p-4'>
              <div>
                <div className='text-sm font-medium'>Số lượng</div>
                <div className='text-sm text-muted-foreground'>Kênh: {channel}</div>
              </div>
              <QuantityStepper value={qty} onChange={setQty} min={1} />
            </section>

            <div className='flex items-center justify-between gap-4 border-t pt-4'>
              <div>
                <div className='text-sm text-muted-foreground'>Tạm tính</div>
                <Money value={unitPrice * qty} className='text-lg font-semibold text-foreground' />
              </div>
              <Button onClick={handleConfirm}>Thêm vào giỏ</Button>
            </div>
          </div>
        ) : null}

        <DialogFooter />
      </DialogContent>
    </Dialog>
  )
}
