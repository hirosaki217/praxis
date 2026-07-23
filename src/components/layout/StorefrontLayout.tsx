import { Link, NavLink, Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ShoppingCartIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ThemeToggle } from '@/components/shared'
import { selectCartItemCount, useCartStore } from '@/features/storefront/cart/cart.store'

export function StorefrontLayout() {
  const { t } = useTranslation()
  const itemCount = useCartStore(selectCartItemCount)

  return (
    <div className='flex min-h-screen flex-col bg-background'>
      <header className='sticky top-0 z-20 border-b bg-background/95 backdrop-blur'>
        <div className='mx-auto flex max-w-6xl items-center gap-3 p-4'>
          <Link to='/' className='text-lg font-extrabold tracking-tight'>
            🍕 {t('common.appName')}
          </Link>
          <div className='hidden flex-1 rounded-full border bg-muted/50 px-4 py-2 text-sm text-muted-foreground md:flex'>
            {t('common.searchPlaceholder')}
          </div>
          <NavLink
            to='/account'
            className={({ isActive }) =>
              cn('inline-flex size-9 items-center justify-center rounded-md border text-sm', isActive && 'bg-muted')
            }
            aria-label={t('common.account')}
          >
            👤
          </NavLink>
          <NavLink
            to='/cart'
            className={({ isActive }) =>
              cn(
                'inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium',
                isActive && 'bg-muted',
              )
            }
            aria-label={t('common.cart')}
          >
            <ShoppingCartIcon className='size-4' />
            <span>{itemCount}</span>
          </NavLink>
          <ThemeToggle />
        </div>
      </header>

      <main className='flex-1'>
        <Outlet />
      </main>

      <footer className='border-t p-4 text-center text-sm text-muted-foreground'>
        {t('common.storefrontShell')}
      </footer>
    </div>
  )
}
