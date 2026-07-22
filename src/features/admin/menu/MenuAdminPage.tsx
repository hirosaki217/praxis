import { DataTable, FeaturePlaceholder, FilterBar, Money, StatusBadge } from '@/components/shared'
import { Button } from '@/components/ui/button'
import { useQuery } from '@tanstack/react-query'
import type { Product } from '@/types'

export default function MenuAdminPage() {
  const { data = [], isLoading } = useQuery({
    queryKey: ['products', 'admin'],
    queryFn: async () => (await fetch('/api/products').then((response) => response.json())) as Product[],
  })

  return (
    <FeaturePlaceholder
      title='Menu Management'
      subtitle='Skeleton bảng quản lý sản phẩm trước khi sang CRUD đầy đủ ở Phase 6.'
      description='Giai đoạn sau sẽ có editor biến thể, topping, combo và bật/tắt bán.'
      actions={<Button>Thêm sản phẩm</Button>}
    >
      <FilterBar>
        <StatusBadge kind='product' status='available' />
      </FilterBar>
      <DataTable<Product>
        columns={[
          { key: 'name', header: 'Tên món', cell: (product) => product.name },
          { key: 'category', header: 'Danh mục', cell: (product) => product.categoryId },
          { key: 'price', header: 'Giá từ', cell: (product) => <Money value={product.variants[0]?.price ?? 0} /> },
          { key: 'status', header: 'Trạng thái', cell: (product) => <StatusBadge kind='product' status={product.available ? 'available' : 'hidden'} /> },
        ]}
        data={data.slice(0, 6)}
        getRowKey={(product) => product.id}
        loading={isLoading}
      />
    </FeaturePlaceholder>
  )
}
