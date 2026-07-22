import { DataTable, FeaturePlaceholder, Money, StatusBadge } from '@/components/shared'
import { useQuery } from '@tanstack/react-query'
import type { Customer } from '@/types'

export default function CustomersPage() {
  const { data = [], isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => (await fetch('/api/customers').then((response) => response.json())) as Customer[],
  })

  return (
    <FeaturePlaceholder
      title='Khách hàng'
      subtitle='Skeleton danh sách khách để chuẩn bị cho loyalty/history ở các phase sau.'
      description='Bước tiếp theo sẽ có chi tiết khách, lịch sử đơn và địa chỉ mặc định.'
    >
      <DataTable<Customer>
        columns={[
          { key: 'name', header: 'Khách hàng', cell: (customer) => customer.name },
          { key: 'phone', header: 'SĐT', cell: (customer) => customer.phone },
          { key: 'spent', header: 'Tổng chi', cell: (customer) => <Money value={customer.totalSpent} /> },
          { key: 'status', header: 'Trạng thái', cell: (customer) => <StatusBadge kind='customer' status={customer.status} /> },
        ]}
        data={data.slice(0, 6)}
        getRowKey={(customer) => customer.id}
        loading={isLoading}
      />
    </FeaturePlaceholder>
  )
}
