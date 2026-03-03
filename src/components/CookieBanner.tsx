'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

export function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const dismissed = localStorage.getItem('vocura_cookie_banner_dismissed')
    if (!dismissed) setVisible(true)
  }, [])

  const dismiss = () => {
    localStorage.setItem('vocura_cookie_banner_dismissed', 'true')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Vi bruker kun nødvendige informasjonskapsler for innlogging og sikkerhet. Ingen sporing eller analyse.{' '}
          <a href="/personvern" className="underline text-indigo-600 dark:text-indigo-400">
            Les mer
          </a>
        </p>
        <button
          onClick={dismiss}
          className="shrink-0 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
          aria-label="Lukk"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
