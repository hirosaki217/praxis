import { Link, NavLink, Outlet } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { ThemeToggle } from '@/components/shared'

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: '📊', end: true },
  { to: '/admin/orders', label: 'Order Board', icon: '📋', end: false },
  { to: '/admin/menu', label: 'Menu', icon: '🍕', end: false },
  { to: '/admin/promotions', label: 'Khuyến mãi', icon: '🎟️', end: false },
  { to: '/admin/customers', label: 'Khách hàng', icon: '👥', end: false },
  { to: '/admin/inventory', label: 'Tồn kho', icon: '📦', end: false },
  { to: '/admin/reports', label: 'Báo cáo', icon: '📈', end: false },
]

export function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-60 shrink-0 border-r md:block">
        <div className="p-4 text-lg font-extrabold tracking-tight">
          🍕 PizzaForge <span className="text-xs font-normal text-muted-foreground">Admin</span>
        </div>
        <nav className="space-y-1 p-2">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )
              }
            >
              <span aria-hidden>{n.icon}</span>
              {n.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between gap-4 border-b p-4">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← Storefront
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <div className="rounded-md border px-3 py-1.5 text-sm">👤 Manager</div>
          </div>
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
