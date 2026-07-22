import type { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'
import { I18nextProvider } from 'react-i18next'
import { Toaster } from '@/components/ui/sonner'
import { i18n } from './i18n'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, refetchOnWindowFocus: false },
  },
})

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute='class' defaultTheme='light' enableSystem={false}>
      <I18nextProvider i18n={i18n}>
        <QueryClientProvider client={queryClient}>
          {children}
          <Toaster richColors position='top-right' />
        </QueryClientProvider>
      </I18nextProvider>
    </ThemeProvider>
  )
}
