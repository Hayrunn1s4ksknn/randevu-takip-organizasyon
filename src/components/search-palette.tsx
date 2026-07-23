'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useUiStore } from '@/store/ui'

type SearchResult = { id: number; label: string; type: 'Kişi' | 'Kurum' | 'Randevu' }

function SearchPaletteContent({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('')
  const router = useRouter()

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const { data } = useQuery({
    queryKey: ['global-search', query],
    queryFn: async (): Promise<{ results: SearchResult[] }> => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      return res.json()
    },
    enabled: query.trim().length > 0,
  })

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-[110px]"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-[560px] max-w-[90vw] overflow-hidden rounded-2xl bg-surface-solid shadow-2xl"
      >
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Kişi, kurum veya randevu ara..."
          className="w-full border-b border-border bg-transparent px-5 py-[18px] text-[15px] text-text-primary outline-none"
        />
        <div className="max-h-80 overflow-auto p-2">
          {(data?.results ?? []).map((r) => (
            <div
              key={`${r.type}-${r.id}`}
              onClick={() => {
                onClose()
                if (r.type === 'Randevu') {
                  router.push('/appointments')
                  useUiStore.getState().openDrawer(r.id)
                } else if (r.type === 'Kişi') {
                  router.push('/contacts')
                  useUiStore.getState().openContactDrawer(r.id)
                } else {
                  router.push('/organizations')
                  useUiStore.getState().openOrgDrawer(r.id)
                }
              }}
              className="flex cursor-pointer justify-between rounded-[9px] px-3.5 py-[11px] text-[13.5px] hover:bg-bg"
            >
              <span>{r.label}</span>
              <span className="text-[11.5px] text-text-secondary">{r.type}</span>
            </div>
          ))}
          {query.trim() && (data?.results.length ?? 0) === 0 && (
            <div className="px-3.5 py-[11px] text-[13px] text-text-secondary">Sonuç bulunamadı.</div>
          )}
        </div>
      </div>
    </div>
  )
}

export function SearchPalette() {
  const searchOpen = useUiStore((s) => s.searchOpen)
  const openSearch = useUiStore((s) => s.openSearch)
  const closeSearch = useUiStore((s) => s.closeSearch)

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        openSearch()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [openSearch])

  if (!searchOpen) return null
  return <SearchPaletteContent onClose={closeSearch} />
}
