import { ChannelTag, DataTable, FeaturePlaceholder, FilterBar, Money, StatusBadge } from '@/components/shared'
import { Button } from '@/components/ui/button'
import { useQuery } from '@tanstack/react-query'
import type { Order } from '@/types'

export default function OrdersPage() {
  const { data = [], isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => (await fetch('/api/orders').then((response) => response.json())) as Order[],
  })

  return (
    <FeaturePlaceholder
      title='Order Board'
      subtitle='Skeleton cho Phase 4 — route đã sẵn sàng để nối kanban/state-machine ở Phase 6.'
      description='Bước tiếp theo sẽ là board theo cột trạng thái, kéo-thả và action transition.'
      actions={<Button variant='outline'>Xuất CSV</Button>}
    >
      <FilterBar>
        <StatusBadge kind='payment' status='pending' />
        <ChannelTag channel='delivery' />
      </FilterBar>
      <DataTable<Order>
        columns={[
          { key: 'code', header: 'Mã đơn', cell: (order) => <span className='font-mono font-medium'>{order.code}</span> },
          { key: 'customer', header: 'Khách hàng', cell: (order) => order.customerName },
          { key: 'channel', header: 'Kênh', cell: (order) => <ChannelTag channel={order.channel} /> },
          { key: 'status', header: 'Trạng thái', cell: (order) => <StatusBadge status={order.status} /> },
          { key: 'total', header: 'Tổng tiền', className: 'text-right', headerClassName: 'text-right', cell: (order) => <Money value={order.totals.grandTotal} className='font-medium' /> },
        ]}
        data={data.slice(0, 5)}
        getRowKey={(order) => order.id}
        loading={isLoading}
        emptyDescription='Khi hoàn thiện admin board, danh sách này sẽ là nguồn cho kanban theo trạng thái.'
      />
    </FeaturePlaceholder>
  )
}
