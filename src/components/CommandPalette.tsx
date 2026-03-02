'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  Mic,
  PenLine,
  BookOpen,
  ClipboardList,
  LayoutGrid,
  Sparkles,
  Moon,
} from 'lucide-react'

interface Action {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  action: () => void
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const close = useCallback(() => {
    setOpen(false)
    setQuery('')
    setSelectedIndex(0)
  }, [])

  const navigate = useCallback(
    (path: string) => {
      close()
      router.push(path)
    },
    [close, router]
  )

  const toggleDarkMode = useCallback(() => {
    const html = document.documentElement
    const isDark = html.classList.contains('dark')
    if (isDark) {
      html.classList.remove('dark')
      localStorage.setItem('vocura_dark_mode', 'false')
    } else {
      html.classList.add('dark')
      localStorage.setItem('vocura_dark_mode', 'true')
    }
    close()
  }, [close])

  const actions: Action[] = [
    { id: 'start-opptak', label: 'Start opptak', icon: Mic, action: () => navigate('/dashboard') },
    { id: 'apne-editor', label: 'Apne editor', icon: PenLine, action: () => navigate('/editor') },
    { id: 'journal', label: 'Journal', icon: BookOpen, action: () => navigate('/journal') },
    { id: 'diktering', label: 'Diktering', icon: Mic, action: () => navigate('/dictation') },
    { id: 'skjemaer', label: 'Skjemaer', icon: ClipboardList, action: () => navigate('/forms') },
    { id: 'maler', label: 'Maler', icon: LayoutGrid, action: () => navigate('/templates') },
    {
      id: 'pasientoppsummering',
      label: 'Pasientoppsummering',
      icon: Sparkles,
      action: () => navigate('/summary'),
    },
    { id: 'bytt-tema', label: 'Bytt tema', icon: Moon, action: toggleDarkMode },
  ]

  const filtered = actions.filter((a) =>
    a.label.toLowerCase().includes(query.toLowerCase())
  )

  // Reset selection when filtered results change
  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  // Scroll selected item into view
  useEffect(() => {
    if (!listRef.current) return
    const items = listRef.current.querySelectorAll('[data-action-item]')
    const selected = items[selectedIndex]
    if (selected) {
      selected.scrollIntoView({ block: 'nearest' })
    }
  }, [selectedIndex])

  // Global keyboard shortcut to open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Auto-focus input when opened
  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => {
        inputRef.current?.focus()
      })
    }
  }, [open])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      close()
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev + 1) % filtered.length)
      return
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % filtered.length)
      return
    }

    if (e.key === 'Enter') {
      e.preventDefault()
      const action = filtered[selectedIndex]
      if (action) {
        action.action()
      }
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]"
      onClick={close}
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60" />

      {/* Dialog */}
      <div
        className="relative max-w-[540px] w-full rounded-lg border border-[rgba(255,255,255,0.06)] bg-[#191919] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3">
          <Search className="w-4 h-4 text-white shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Sok etter handlinger, sider..."
            className="w-full bg-transparent border-none outline-none text-sm text-white placeholder:text-white"
          />
        </div>

        {/* Divider */}
        <div className="border-t border-[rgba(255,255,255,0.06)]" />

        {/* Actions list */}
        <div ref={listRef} className="py-2 max-h-[320px] overflow-y-auto">
          {filtered.length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-white">
              Ingen resultater
            </div>
          )}
          {filtered.map((action, index) => {
            const Icon = action.icon
            const isSelected = index === selectedIndex
            return (
              <button
                key={action.id}
                data-action-item
                type="button"
                onClick={() => action.action()}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`flex items-center gap-3 py-2.5 px-4 w-full text-left cursor-pointer rounded-lg mx-0 transition-colors ${
                  isSelected
                    ? 'bg-[rgba(94,106,210,0.1)] text-[#7B89DB]'
                    : 'hover:bg-[rgba(255,255,255,0.05)] text-white'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isSelected ? 'text-[#7B89DB]' : 'text-white'
                  }`}
                />
                <span className="text-sm">{action.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
