import { useEffect, useMemo, useState } from 'react'
import { SearchIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from '@/components/ui/input-group'
import {
  ChannelTag,
  EmptyState,
  ErrorState,
  FilterBar,
  LoadingState,
  PageHeader,
  SegmentedControl,
} from '@/components/shared'
import type { Category, Channel, Product } from '@/types'
import { useStorefrontBranches } from './hooks/useStorefrontBranches'
import { useMenuCategories } from './hooks/useMenuCategories'
import { useMenuProducts } from './hooks/useMenuProducts'
import { MenuProductCard } from './components/MenuProductCard'
import { ProductConfiguratorDialog } from './components/ProductConfiguratorDialog'
import { useCartStore } from '@/features/storefront/cart/cart.store'

const CHANNELS: { value: Channel; label: string }[] = [
  { value: 'delivery', label: '🛵 Giao' },
  { value: 'pickup', label: '🏪 Lấy' },
  { value: 'dine-in', label: '🍽️ Quán' },
]

const ALL_CATEGORY = 'all'

export default function MenuPage() {
  const cartChannel = useCartStore((state) => state.channel)
  const hydrateFromBranch = useCartStore((state) => state.hydrateFromBranch)
  const setChannel = useCartStore((state) => state.setChannel)
  const [channel, setLocalChannel] = useState<Channel>(cartChannel)
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState<string>(ALL_CATEGORY)
  const [activeProduct, setActiveProduct] = useState<Product | null>(null)
  const { data: branches = [] } = useStorefrontBranches()
  const { data: categories = [], isLoading: categoriesLoading } = useMenuCategories()
  const {
    data: products = [],
    isLoading: productsLoading,
    isError,
    refetch,
  } = useMenuProducts({
    categoryId: categoryId === ALL_CATEGORY ? undefined : categoryId,
    search: search.trim() || undefined,
  })

  useEffect(() => {
    const firstOpenBranch = branches.find((branch) => branch.status === 'open')
    if (firstOpenBranch) hydrateFromBranch(firstOpenBranch)
  }, [branches, hydrateFromBranch])

  const allCategories = useMemo<Category[]>(() => {
    const synthetic = { id: ALL_CATEGORY, name: 'Tất cả', slug: ALL_CATEGORY, sortOrder: 0 }
    return [synthetic, ...categories]
  }, [categories])

  const handleChannelChange = (next: Channel) => {
    setLocalChannel(next)
    setChannel(next)
  }

  return (
    <div className='mx-auto max-w-6xl space-y-6 p-6'>
      <PageHeader
        title='🍕 PizzaForge'
        subtitle='Khám phá menu, chọn cấu hình món và thêm vào giỏ hàng trong một flow liền mạch.'
        actions={<ChannelTag channel={channel} size='md' />}
      />

      <FilterBar>
        <SegmentedControl value={channel} onChange={handleChannelChange} options={CHANNELS} />
        <InputGroup className='min-w-[260px] max-w-md'>
          <InputGroupAddon>
            <InputGroupText>
              <SearchIcon className='size-4' />
            </InputGroupText>
          </InputGroupAddon>
          <InputGroupInput
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder='Tìm pizza, món ăn kèm…'
            aria-label='Tìm sản phẩm'
          />
        </InputGroup>
      </FilterBar>

      <section className='space-y-3'>
        <div className='flex flex-wrap gap-2'>
          {categoriesLoading ? (
            <LoadingState className='justify-start p-0' />
          ) : (
            allCategories.map((category) => (
              <Button
                key={category.id}
                type='button'
                variant={categoryId === category.id ? 'default' : 'outline'}
                onClick={() => setCategoryId(category.id)}
              >
                {category.name}
              </Button>
            ))
          )}
        </div>
      </section>

      {productsLoading ? <LoadingState className='rounded-xl border' /> : null}
      {isError ? (
        <ErrorState
          title='Không tải được menu'
          description='Vui lòng thử lại để lấy danh sách sản phẩm mới nhất.'
          onRetry={() => void refetch()}
        />
      ) : null}
      {!productsLoading && !isError && !products.length ? (
        <EmptyState
          title='Không tìm thấy món phù hợp'
          description='Thử đổi từ khóa tìm kiếm hoặc chọn danh mục khác.'
        />
      ) : null}

      {!productsLoading && !isError && products.length ? (
        <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-3'>
          {products.map((product) => (
            <MenuProductCard key={product.id} product={product} onQuickAdd={setActiveProduct} />
          ))}
        </div>
      ) : null}

      <ProductConfiguratorDialog
        product={activeProduct}
        channel={channel}
        open={Boolean(activeProduct)}
        onOpenChange={(open) => {
          if (!open) setActiveProduct(null)
        }}
      />
    </div>
  )
}
