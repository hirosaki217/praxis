import { Link, NavLink, Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { ThemeToggle } from '@/components/shared'

const CATS = ['Pizza', 'Món kèm', 'Đồ uống', 'Tráng miệng', 'Combos']

export function StorefrontLayout() {
  const { t } = useTranslation()

  return (
    <div className='flex min-h-screen flex-col bg-background'>
      <header className='sticky top-0 z-20 border-b bg-background/95 backdrop-blur'>
        <div className='mx-auto flex max-w-5xl items-center gap-3 p-4'>
          <Link to='/' className='text-lg font-extrabold tracking-tight'>
            🍕 {t('common.appName')}
          </Link>
          <div className='flex flex-1 items-center gap-2 rounded-full border bg-muted/50 px-4 py-2 text-sm text-muted-foreground'>
            🔍 {t('common.searchPlaceholder')}
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
              cn('inline-flex size-9 items-center justify-center rounded-md border text-sm', isActive && 'bg-muted')
            }
            aria-label={t('common.cart')}
          >
            🛒
          </NavLink>
          <ThemeToggle />
        </div>
        <nav className='border-t'>
          <div className='mx-auto flex max-w-5xl gap-1 overflow-x-auto px-4'>
            {CATS.map((c, i) => (
              <Link
                key={c}
                to='/'
                className={cn(
                  'whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium',
                  i === 0 ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground',
                )}
              >
                {c}
              </Link>
            ))}
          </div>
        </nav>
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
