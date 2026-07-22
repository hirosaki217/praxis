import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FeaturePlaceholder, Money, Stat, StatusBadge } from '@/components/shared'

export default function AccountPage() {
  return (
    <FeaturePlaceholder
      title='Tài khoản'
      subtitle='Skeleton trang tài khoản để khớp header storefront.'
      description='Phase 5 sẽ thêm lịch sử đơn, địa chỉ mặc định và loyalty card.'
    >
      <div className='grid gap-4 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>Hồ sơ khách hàng</CardTitle>
          </CardHeader>
          <CardContent className='grid gap-4'>
            <Stat label='Hạng thành viên' value='Gold' meta={<StatusBadge kind='customer' status='active' />} />
            <Stat label='Tổng chi tiêu' value={<Money value={14200000} />} meta='42 đơn hoàn tất' />
          </CardContent>
        </Card>
      </div>
    </FeaturePlaceholder>
  )
}
