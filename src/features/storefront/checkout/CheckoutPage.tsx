import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ChannelTag, FeaturePlaceholder, FormRow } from '@/components/shared'

export default function CheckoutPage() {
  return (
    <FeaturePlaceholder
      title='Checkout'
      subtitle='Skeleton form cho flow đặt hàng đa kênh.'
      description='Phase 5 sẽ nối RHF + Zod, đổi fulfilment theo channel và submit POST /api/orders.'
      actions={<ChannelTag channel='delivery' size='md' />}
    >
      <div className='grid gap-4 rounded-xl border bg-card p-4 md:grid-cols-2'>
        <FormRow label='Họ tên' htmlFor='checkout-name' required>
          <Input id='checkout-name' placeholder='Nguyễn Văn An' />
        </FormRow>
        <FormRow label='Số điện thoại' htmlFor='checkout-phone' required>
          <Input id='checkout-phone' placeholder='0901 234 567' />
        </FormRow>
        <FormRow label='Địa chỉ giao hàng' htmlFor='checkout-address' className='md:col-span-2'>
          <Input id='checkout-address' placeholder='123 Nguyễn Huệ, Quận 1' />
        </FormRow>
        <div className='md:col-span-2'>
          <Button>Đặt hàng</Button>
        </div>
      </div>
    </FeaturePlaceholder>
  )
}
