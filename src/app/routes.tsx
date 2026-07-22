import { lazy, Suspense, type ReactNode } from 'react'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { StorefrontLayout } from '@/components/layout/StorefrontLayout'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { LoadingState } from '@/components/shared'

const MenuPage = lazy(() => import('@/features/storefront/menu/MenuPage'))
const CartPage = lazy(() => import('@/features/storefront/cart/CartPage'))
const CheckoutPage = lazy(() => import('@/features/storefront/checkout/CheckoutPage'))
const AccountPage = lazy(() => import('@/features/storefront/account/AccountPage'))
const TrackingPage = lazy(() => import('@/features/storefront/tracking/TrackingPage'))
const DashboardPage = lazy(() => import('@/features/admin/dashboard/DashboardPage'))
const OrdersPage = lazy(() => import('@/features/admin/orders/OrdersPage'))
const MenuAdminPage = lazy(() => import('@/features/admin/menu/MenuAdminPage'))
const PromotionsPage = lazy(() => import('@/features/admin/promotions/PromotionsPage'))
const CustomersPage = lazy(() => import('@/features/admin/customers/CustomersPage'))
const InventoryPage = lazy(() => import('@/features/admin/inventory/InventoryPage'))
const ReportsPage = lazy(() => import('@/features/admin/reports/ReportsPage'))

const fallback = <LoadingState className='p-20' />
const withSuspense = (element: ReactNode) => <Suspense fallback={fallback}>{element}</Suspense>

const router = createBrowserRouter([
  {
    path: '/',
    element: <StorefrontLayout />,
    children: [
      { index: true, element: withSuspense(<MenuPage />) },
      { path: 'cart', element: withSuspense(<CartPage />) },
      { path: 'checkout', element: withSuspense(<CheckoutPage />) },
      { path: 'account', element: withSuspense(<AccountPage />) },
      { path: 'track/:orderId', element: withSuspense(<TrackingPage />) },
      { path: '*', element: <Navigate to='/' replace /> },
    ],
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: withSuspense(<DashboardPage />) },
      { path: 'orders', element: withSuspense(<OrdersPage />) },
      { path: 'menu', element: withSuspense(<MenuAdminPage />) },
      { path: 'promotions', element: withSuspense(<PromotionsPage />) },
      { path: 'customers', element: withSuspense(<CustomersPage />) },
      { path: 'inventory', element: withSuspense(<InventoryPage />) },
      { path: 'reports', element: withSuspense(<ReportsPage />) },
      { path: '*', element: <Navigate to='/admin' replace /> },
    ],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
