import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FeaturePlaceholder, MiniBarChart, Money, Stat } from '@/components/shared'

const chartData = [
  { label: 'T2', value: 3_200_000 },
  { label: 'T3', value: 4_100_000 },
  { label: 'T4', value: 3_800_000 },
  { label: 'T5', value: 5_000_000, highlight: true },
  { label: 'T6', value: 4_600_000 },
  { label: 'T7', value: 4_950_000 },
]

export default function ReportsPage() {
  return (
    <FeaturePlaceholder
      title='Báo cáo'
      subtitle='Skeleton biểu đồ để khóa phase shell + shared component.'
      description='Giai đoạn sau sẽ có filter thời gian/chi nhánh/kênh và xuất CSV.'
    >
      <div className='grid gap-4 lg:grid-cols-[1.4fr_1fr]'>
        <Card>
          <CardHeader>
            <CardTitle>Doanh thu 7 ngày</CardTitle>
          </CardHeader>
          <CardContent>
            <MiniBarChart data={chartData} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className='grid gap-4 p-4'>
            <Stat label='Doanh thu tuần' value={<Money value={29_650_000} />} meta='+12% so với tuần trước' />
            <Stat label='Đơn trung bình' value='312.000 ₫' meta='Ổn định trên 300k' />
          </CardContent>
        </Card>
      </div>
    </FeaturePlaceholder>
  )
}
