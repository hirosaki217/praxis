import { useEffect, useMemo } from 'react'
import type { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ChannelTag, EmptyState, FormRow, PageHeader, PriceBreakdown } from '@/components/shared'
import { createOrderSchema } from '@/validation/order'
import type { CreateOrderInput } from '@/validation/order'
import { useCartStore, selectCartTotals } from '@/features/storefront/cart/cart.store'
import { useStorefrontBranches } from '@/features/storefront/menu/hooks/useStorefrontBranches'
import { useCheckoutCustomers } from './hooks/useCheckoutCustomers'
import { useCreateOrder } from './hooks/useCreateOrder'
import { createCheckoutDefaults, mapCartLinesToOrderLines, type CheckoutValues } from './checkout.types'

const checkoutFormSchema = createOrderSchema
  .omit({ channel: true, lines: true, fulfilment: true, promotionCodes: true })
  .extend({
    addressId: createOrderSchema.shape.fulfilment.options[0].shape.addressId,
    deliveryNote: createOrderSchema.shape.fulfilment.options[0].shape.note,
    pickupBranchId: createOrderSchema.shape.fulfilment.options[1].shape.branchId,
    pickupSlot: createOrderSchema.shape.fulfilment.options[1].shape.slot,
    dineInBranchId: createOrderSchema.shape.fulfilment.options[2].shape.branchId,
    tableId: createOrderSchema.shape.fulfilment.options[2].shape.tableId,
  })

type CheckoutFormValues = z.infer<typeof checkoutFormSchema>

export default function CheckoutPage() {
  const navigate = useNavigate()
  const lines = useCartStore((state) => state.lines)
  const channel = useCartStore((state) => state.channel)
  const context = useCartStore((state) => state.context)
  const clear = useCartStore((state) => state.clear)
  const totals = useCartStore(selectCartTotals)
  const { data: branches = [] } = useStorefrontBranches()
  const { data: customers = [] } = useCheckoutCustomers()
  const createOrder = useCreateOrder()

  const primaryCustomer = customers[0]
  const defaultAddress = primaryCustomer?.addresses[0]
  const openBranches = useMemo(() => branches.filter((branch) => branch.status === 'open'), [branches])

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: createCheckoutDefaults({
      channel,
      address: defaultAddress,
      customerName: primaryCustomer?.name,
      customerPhone: primaryCustomer?.phone,
    }),
  })

  useEffect(() => {
    form.reset(
      createCheckoutDefaults({
        channel,
        address: defaultAddress,
        customerName: primaryCustomer?.name,
        customerPhone: primaryCustomer?.phone,
      }),
    )
  }, [channel, defaultAddress, form, primaryCustomer?.name, primaryCustomer?.phone])

  const handleSubmit = form.handleSubmit(async (values) => {
    const fulfilment =
      channel === 'delivery'
        ? { channel: 'delivery' as const, addressId: values.addressId, note: values.deliveryNote || undefined }
        : channel === 'pickup'
          ? { channel: 'pickup' as const, branchId: values.pickupBranchId, slot: values.pickupSlot }
          : { channel: 'dine-in' as const, branchId: values.dineInBranchId, tableId: values.tableId }

    const payload: CreateOrderInput = {
      channel,
      customerName: values.customerName,
      customerPhone: values.customerPhone,
      lines: mapCartLinesToOrderLines(lines),
      fulfilment,
      paymentMethod: values.paymentMethod,
      promotionCodes: [],
    }

    const order = await createOrder.mutateAsync(payload)

    clear()
    navigate(`/track/${order.id}`)
  })

  if (!lines.length) {
    return (
      <div className='mx-auto max-w-5xl p-6'>
        <EmptyState
          title='Chưa có món để checkout'
          description='Thêm ít nhất một món vào giỏ rồi quay lại checkout.'
        />
      </div>
    )
  }

  return (
    <div className='mx-auto max-w-6xl space-y-6 p-6'>
      <PageHeader
        title='Checkout'
        subtitle='Xác nhận thông tin giao nhận, phương thức thanh toán và gửi đơn ngay.'
        actions={<ChannelTag channel={channel} size='md' />}
      />

      <div className='grid gap-4 lg:grid-cols-[1.45fr_1fr]'>
        <form className='space-y-4 rounded-xl border bg-card p-4' onSubmit={handleSubmit}>
          <div className='grid gap-4 md:grid-cols-2'>
            <FormRow
              label='Họ tên'
              htmlFor='checkout-name'
              required
              error={form.formState.errors.customerName?.message}
            >
              <Input id='checkout-name' {...form.register('customerName')} placeholder='Nguyễn Văn An' />
            </FormRow>
            <FormRow
              label='Số điện thoại'
              htmlFor='checkout-phone'
              required
              error={form.formState.errors.customerPhone?.message}
            >
              <Input id='checkout-phone' {...form.register('customerPhone')} placeholder='0901 234 567' />
            </FormRow>
          </div>

          {channel === 'delivery' ? (
            <>
              <FormRow
                label='Địa chỉ giao hàng'
                htmlFor='checkout-address'
                required
                error={form.formState.errors.addressId?.message}
              >
                <Select
                  value={form.watch('addressId')}
                  onValueChange={(value: string) => form.setValue('addressId', value, { shouldValidate: true })}
                >
                  <SelectTrigger id='checkout-address' className='w-full'>
                    <SelectValue placeholder='Chọn địa chỉ giao hàng' />
                  </SelectTrigger>
                  <SelectContent>
                    {primaryCustomer?.addresses.map((address) => (
                      <SelectItem key={address.id} value={address.id}>
                        {address.label} · {address.street}, {address.district}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormRow>
              <FormRow label='Ghi chú cho shipper' htmlFor='checkout-note'>
                <Textarea id='checkout-note' {...form.register('deliveryNote')} placeholder='Ví dụ: gọi trước khi giao' />
              </FormRow>
            </>
          ) : null}

          {channel === 'pickup' ? (
            <div className='grid gap-4 md:grid-cols-2'>
              <FormRow label='Chi nhánh nhận hàng' required error={form.formState.errors.pickupBranchId?.message}>
                <Select
                  value={form.watch('pickupBranchId')}
                  onValueChange={(value: string) => form.setValue('pickupBranchId', value, { shouldValidate: true })}
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Chọn chi nhánh' />
                  </SelectTrigger>
                  <SelectContent>
                    {openBranches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormRow>
              <FormRow label='Khung giờ nhận' htmlFor='checkout-slot' required error={form.formState.errors.pickupSlot?.message}>
                <Input id='checkout-slot' {...form.register('pickupSlot')} placeholder='11:30–12:00' />
              </FormRow>
            </div>
          ) : null}

          {channel === 'dine-in' ? (
            <div className='grid gap-4 md:grid-cols-2'>
              <FormRow label='Chi nhánh' required error={form.formState.errors.dineInBranchId?.message}>
                <Select
                  value={form.watch('dineInBranchId')}
                  onValueChange={(value: string) => form.setValue('dineInBranchId', value, { shouldValidate: true })}
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Chọn chi nhánh' />
                  </SelectTrigger>
                  <SelectContent>
                    {openBranches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormRow>
              <FormRow label='Số bàn' htmlFor='checkout-table' required error={form.formState.errors.tableId?.message}>
                <Input id='checkout-table' {...form.register('tableId')} placeholder='Bàn 12' />
              </FormRow>
            </div>
          ) : null}

          <FormRow label='Thanh toán' required error={form.formState.errors.paymentMethod?.message}>
            <Select
              value={form.watch('paymentMethod')}
              onValueChange={(value: string) =>
                form.setValue('paymentMethod', value as CheckoutValues['paymentMethod'], { shouldValidate: true })
              }
            >
              <SelectTrigger className='w-full'>
                <SelectValue placeholder='Chọn phương thức thanh toán' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='cod'>COD</SelectItem>
                <SelectItem value='momo'>MoMo</SelectItem>
                <SelectItem value='card'>Thẻ</SelectItem>
                <SelectItem value='zalopay'>ZaloPay</SelectItem>
              </SelectContent>
            </Select>
          </FormRow>

          <div className='flex justify-end'>
            <Button type='submit' disabled={createOrder.isPending}>
              {createOrder.isPending ? 'Đang tạo đơn…' : 'Đặt hàng'}
            </Button>
          </div>
        </form>

        <PriceBreakdown
          lines={[{ label: 'Tạm tính', value: totals.linesSubtotal }]}
          discounts={[]}
          fee={channel === 'delivery' ? context.deliveryFee : 0}
          tax={totals.tax}
          total={totals.grandTotal}
          points={totals.pointsToEarn}
        />
      </div>
    </div>
  )
}
