'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function ThemeDebug() {
  const [mounted, setMounted] = useState(false)
  const { theme, resolvedTheme, systemTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-xs shadow-lg z-50">
      <div className="text-gray-700 dark:text-gray-300">
        <div><strong>Theme:</strong> {theme}</div>
        <div><strong>Resolved:</strong> {resolvedTheme}</div>
        <div><strong>System:</strong> {systemTheme}</div>
        <div><strong>HTML class:</strong> {typeof document !== 'undefined' ? document.documentElement.classList.toString() : 'N/A'}</div>
      </div>
    </div>
  )
}