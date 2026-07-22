import { Button } from '@/components/ui/button'
import { QuantityStepper, ChannelTag, FeaturePlaceholder, Money, PriceBreakdown } from '@/components/shared'

export default function CartPage() {
  return (
    <FeaturePlaceholder
      title='Giỏ hàng'
      subtitle='Skeleton route cho storefront trước khi làm cart store thật ở Phase 5.'
      description='Tiếp theo sẽ nối Zustand cart, voucher và tính giá realtime từ pricing engine.'
      actions={<Button>Tiếp tục thanh toán</Button>}
    >
      <div className='grid gap-4 lg:grid-cols-[1.5fr_1fr]'>
        <div className='space-y-4 rounded-xl border bg-card p-4'>
          <div className='flex items-center justify-between gap-3'>
            <div>
              <div className='font-medium'>Pepperoni Feast</div>
              <div className='text-sm text-muted-foreground'>Size M · Extra Cheese</div>
            </div>
            <ChannelTag channel='delivery' />
          </div>
          <div className='flex items-center justify-between gap-4'>
            <QuantityStepper value={2} onChange={() => undefined} />
            <Money value={258000} className='font-semibold' />
          </div>
        </div>
        <PriceBreakdown
          lines={[{ label: 'Tạm tính', value: 258000 }]}
          discounts={[{ label: 'Voucher PIZZA30', value: 77400 }]}
          fee={25000}
          tax={16448}
          total={222048}
          points={22}
        />
      </div>
    </FeaturePlaceholder>
  )
}
