import { useTranslation } from 'react-i18next'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'

interface ThemeToggleProps {
  className?: string
  showLabel?: boolean
}

export default function ThemeToggle({ className = '', showLabel = false }: ThemeToggleProps) {
  const { t } = useTranslation()
  const { resolvedTheme, toggleTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const label = isDark ? t('theme.switchToLight', 'Switch to light mode') : t('theme.switchToDark', 'Switch to dark mode')

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className={`group relative inline-flex items-center justify-center gap-2 rounded-full transition-colors focus-visible:outline-2 ${className}`}
    >
      <span className="relative flex size-5 items-center justify-center">
        {isDark ? (
          <Sun aria-hidden className="size-5 text-saffron transition-transform duration-300 group-hover:rotate-45" />
        ) : (
          <Moon aria-hidden className="size-5 text-navy transition-transform duration-300 group-hover:-rotate-12" />
        )}
      </span>
      {showLabel && (
        <span className="text-sm font-semibold text-ink">
          {isDark ? t('theme.light', 'Light') : t('theme.dark', 'Dark')}
        </span>
      )}
    </button>
  )
}
