import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

async function enableMocking() {
  // Chỉ bật MSW ở dev và khi chưa cấu hình API thật
  if (import.meta.env.DEV && !import.meta.env.VITE_API_URL) {
    const { worker } = await import('@/lib/mock/browser')
    await worker.start({ onUnhandledRequest: 'warn' })
  }
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
