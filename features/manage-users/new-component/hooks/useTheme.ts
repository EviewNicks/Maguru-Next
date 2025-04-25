import { useState, useCallback } from 'react'

type Theme = 'dark' | 'light'

interface UseThemeReturn {
  theme: Theme
  toggleTheme: () => void
}

/**
 * Hook untuk mengelola tema aplikasi (dark/light)
 */
export function useTheme(initialTheme: Theme = 'dark'): UseThemeReturn {
  const [theme, setTheme] = useState<Theme>(initialTheme)

  const toggleTheme = useCallback(() => {
    setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'))
  }, [])

  return { theme, toggleTheme }
}
