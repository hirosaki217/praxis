import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme()
  const isDark = theme === 'dark'
  return (
    <button
      type="button"
      aria-label={isDark ? 'Chuyển sang sáng' : 'Chuyển sang tối'}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={cn(
        'inline-flex size-9 items-center justify-center rounded-md border text-sm hover:bg-muted',
        className,
      )}
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  )
}
