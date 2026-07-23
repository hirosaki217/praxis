import { SearchIcon } from 'lucide-react'
import { FilterBar, SegmentedControl } from '@/components/shared'
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from '@/components/ui/input-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Channel, PaymentStatus } from '@/types'

const CHANNEL_OPTIONS: Array<{ value: Channel | 'all'; label: string }> = [
  { value: 'all', label: 'Tất cả kênh' },
  { value: 'delivery', label: 'Delivery' },
  { value: 'pickup', label: 'Pickup' },
  { value: 'dine-in', label: 'Dine-in' },
]

const PAYMENT_OPTIONS: Array<{ value: PaymentStatus | 'all'; label: string }> = [
  { value: 'all', label: 'Mọi thanh toán' },
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'failed', label: 'Failed' },
  { value: 'refunded', label: 'Refunded' },
]

const DATE_RANGE_OPTIONS = [
  { value: 'all', label: 'Toàn bộ' },
  { value: 'today', label: 'Hôm nay' },
  { value: 'last7', label: '7 ngày' },
  { value: 'last30', label: '30 ngày' },
] as const

export interface OrderFiltersState {
  channel: Channel | 'all'
  paymentStatus: PaymentStatus | 'all'
  search: string
  dateRange: (typeof DATE_RANGE_OPTIONS)[number]['value']
}

export interface OrderFiltersProps {
  value: OrderFiltersState
  onChange: (value: OrderFiltersState) => void
}

export function OrderFilters({ value, onChange }: OrderFiltersProps) {
  return (
    <FilterBar>
      <Select
        value={value.channel}
        onValueChange={(next: string) => onChange({ ...value, channel: next as OrderFiltersState['channel'] })}
      >
        <SelectTrigger className='w-full sm:w-48'>
          <SelectValue placeholder='Kênh' />
        </SelectTrigger>
        <SelectContent>
          {CHANNEL_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={value.paymentStatus}
        onValueChange={(next: string) =>
          onChange({ ...value, paymentStatus: next as OrderFiltersState['paymentStatus'] })
        }
      >
        <SelectTrigger className='w-full sm:w-48'>
          <SelectValue placeholder='Thanh toán' />
        </SelectTrigger>
        <SelectContent>
          {PAYMENT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <InputGroup className='min-w-[260px] max-w-md'>
        <InputGroupAddon>
          <InputGroupText>
            <SearchIcon className='size-4' />
          </InputGroupText>
        </InputGroupAddon>
        <InputGroupInput
          value={value.search}
          onChange={(event) => onChange({ ...value, search: event.target.value })}
          placeholder='Tìm theo mã đơn, khách hàng, số điện thoại'
          aria-label='Tìm đơn hàng'
        />
      </InputGroup>

      <SegmentedControl
        value={value.dateRange}
        onChange={(next) => onChange({ ...value, dateRange: next })}
        options={DATE_RANGE_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
      />
    </FilterBar>
  )
}
