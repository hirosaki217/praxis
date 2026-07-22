import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChannelTag, KpiCard, MiniBarChart, Money, PageHeader, Stat, StatusBadge } from '@/components/shared'

const KPIS = [
  { label: 'Doanh thu hôm nay', value: 12480000, delta: '+8.2%', trend: 'up' as const },
  { label: 'Số đơn', value: 186, delta: '+14', trend: 'up' as const },
  { label: 'AOV', value: 320000, delta: '-2.4%', trend: 'down' as const },
  { label: 'Đơn đang xử lý', value: 24, delta: 'Live', trend: 'neutral' as const },
]

const RECENT: { code: string; channel: 'delivery' | 'pickup' | 'dine-in'; status: Parameters<typeof StatusBadge>[0]['status']; total: number }[] = [
  { code: 'PF-20453', channel: 'delivery', status: 'created', total: 738000 },
  { code: 'PF-20452', channel: 'dine-in', status: 'preparing', total: 412000 },
  { code: 'PF-20451', channel: 'delivery', status: 'out_for_delivery', total: 560000 },
  { code: 'PF-20450', channel: 'pickup', status: 'completed', total: 289000 },
]

const chartData = [
  { label: '10h', value: 1_200_000 },
  { label: '11h', value: 1_950_000 },
  { label: '12h', value: 2_300_000, highlight: true },
  { label: '13h', value: 1_600_000 },
  { label: '14h', value: 1_100_000 },
]

export default function DashboardPage() {
  return (
    <div className='space-y-6'>
      <PageHeader title='Dashboard' subtitle='P4a — demo AdminLayout + shared components' />

      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {KPIS.map((k) => (
          <KpiCard
            key={k.label}
            label={k.label}
            value={k.label.includes('Số đơn') || k.label.includes('xử lý') ? k.value : <Money value={k.value} />}
            delta={k.delta}
            trend={k.trend}
          />
        ))}
      </div>

      <div className='grid gap-4 xl:grid-cols-[1.4fr_1fr]'>
        <Card>
          <CardHeader>
            <CardTitle>Doanh thu theo giờ</CardTitle>
          </CardHeader>
          <CardContent>
            <MiniBarChart data={chartData} height={240} ariaLabel='Biểu đồ doanh thu theo giờ' />
          </CardContent>
        </Card>

        <Card>
          <CardContent className='grid gap-4 p-4'>
            <Stat label='Kênh mạnh nhất' value={<ChannelTag channel='delivery' size='md' />} meta='Chiếm 56% số đơn hôm nay' />
            <Stat label='AOV mục tiêu' value={<Money value={350000} />} meta='Còn thiếu 30.000 ₫ để chạm mục tiêu' />
          </CardContent>
        </Card>
      </div>

      <Card className='p-4'>
        <div className='mb-3 font-medium'>Đơn gần đây</div>
        <div className='space-y-2'>
          {RECENT.map((o) => (
            <div key={o.code} className='flex items-center justify-between gap-2 text-sm'>
              <span className='font-mono font-medium'>{o.code}</span>
              <ChannelTag channel={o.channel} />
              <StatusBadge status={o.status} />
              <Money value={o.total} className='ml-auto font-medium' />
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
