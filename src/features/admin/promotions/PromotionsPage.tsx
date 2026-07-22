import { DataTable, FeaturePlaceholder, Money, StatusBadge } from '@/components/shared'
import { Button } from '@/components/ui/button'
import { useQuery } from '@tanstack/react-query'
import type { Promotion } from '@/types'

export default function PromotionsPage() {
  const { data = [], isLoading } = useQuery({
    queryKey: ['promotions'],
    queryFn: async () => (await fetch('/api/promotions').then((response) => response.json())) as Promotion[],
  })

  return (
    <FeaturePlaceholder
      title='Khuyến mãi'
      subtitle='Trang skeleton để nối voucher CRUD ở Phase 6.'
      description='Ở bước sau sẽ có editor điều kiện, cap, lịch chạy và validate code.'
      actions={<Button>Thêm voucher</Button>}
    >
      <DataTable<Promotion>
        columns={[
          { key: 'code', header: 'Mã', cell: (promotion) => <span className='font-mono font-medium'>{promotion.code}</span> },
          { key: 'name', header: 'Tên CTKM', cell: (promotion) => promotion.name },
          { key: 'value', header: 'Giá trị', cell: (promotion) => promotion.type === 'percent' ? `${promotion.value}%` : <Money value={promotion.value} /> },
          { key: 'status', header: 'Trạng thái', cell: (promotion) => <StatusBadge kind='product' status={promotion.active ? 'available' : 'hidden'} /> },
        ]}
        data={data.slice(0, 6)}
        getRowKey={(promotion) => promotion.id}
        loading={isLoading}
      />
    </FeaturePlaceholder>
  )
}
