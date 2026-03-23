import { useEffect } from 'react'
import { useSettingsStore } from '../../../shared/store/settingsStore'

export function useDarkMode() {
  const darkMode = useSettingsStore((s) => s.darkMode)

  useEffect(() => {
    const root = document.documentElement

    if (darkMode === 'dark') {
      root.classList.add('dark')
      return
    }

    if (darkMode === 'light') {
      root.classList.remove('dark')
      return
    }

    // system — follow OS preference and listen for changes
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = (dark: boolean) => root.classList.toggle('dark', dark)
    apply(mq.matches)
    const listener = (e: MediaQueryListEvent) => apply(e.matches)
    mq.addEventListener('change', listener)
    return () => mq.removeEventListener('change', listener)
  }, [darkMode])
}
