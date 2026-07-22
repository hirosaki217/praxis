import { DataTable, FeaturePlaceholder, StatusBadge } from '@/components/shared'

const rows = [
  { id: 'inv-1', name: 'Mozzarella', stock: '18 kg', status: 'in_stock' as const },
  { id: 'inv-2', name: 'Bột pizza', stock: '6 bao', status: 'low_stock' as const },
  { id: 'inv-3', name: 'Pepperoni', stock: '0 khay', status: 'out_of_stock' as const },
]

export default function InventoryPage() {
  return (
    <FeaturePlaceholder
      title='Tồn kho'
      subtitle='Skeleton kiểm kê để hoàn thiện nav admin ở Phase 4.'
      description='Phase 6 sẽ nối bảng nguyên liệu, cảnh báo mức tồn và cập nhật nhập/xuất.'
    >
      <DataTable<{ id: string; name: string; stock: string; status: 'in_stock' | 'low_stock' | 'out_of_stock' }>
        columns={[
          { key: 'name', header: 'Nguyên liệu', cell: (row) => row.name },
          { key: 'stock', header: 'Tồn hiện tại', cell: (row) => row.stock },
          { key: 'status', header: 'Mức tồn', cell: (row) => <StatusBadge kind='inventory' status={row.status} /> },
        ]}
        data={rows}
        getRowKey={(row) => row.id}
      />
    </FeaturePlaceholder>
  )
}
