import { create } from 'zustand'

const SIDEBAR_STORAGE_KEY = 'technoscope-sidebar-open'

type Toast = { id: number; message: string }
export type ModalKey =
  | 'appointment'
  | 'contact'
  | 'organization'
  | 'task'
  | 'edit-contact'
  | 'edit-organization'
  | 'edit-task'
  | null

interface UiState {
  searchOpen: boolean
  openSearch: () => void
  closeSearch: () => void

  activeModal: ModalKey
  editTargetId: number | null
  openModal: (key: ModalKey, editTargetId?: number) => void
  closeModal: () => void

  drawerApptId: number | null
  openDrawer: (id: number) => void
  closeDrawer: () => void

  contactDrawerId: number | null
  openContactDrawer: (id: number) => void
  closeContactDrawer: () => void

  orgDrawerId: number | null
  openOrgDrawer: (id: number) => void
  closeOrgDrawer: () => void

  mobileNavOpen: boolean
  openMobileNav: () => void
  closeMobileNav: () => void

  desktopSidebarOpen: boolean
  toggleDesktopSidebar: () => void
  hydrateDesktopSidebar: () => void

  toasts: Toast[]
  showToast: (message: string) => void
  dismissToast: (id: number) => void
}

let toastId = 0

export const useUiStore = create<UiState>((set) => ({
  searchOpen: false,
  openSearch: () => set({ searchOpen: true }),
  closeSearch: () => set({ searchOpen: false }),

  activeModal: null,
  editTargetId: null,
  openModal: (key, editTargetId) => set({ activeModal: key, editTargetId: editTargetId ?? null }),
  closeModal: () => set({ activeModal: null, editTargetId: null }),

  drawerApptId: null,
  openDrawer: (id) => set({ drawerApptId: id }),
  closeDrawer: () => set({ drawerApptId: null }),

  contactDrawerId: null,
  openContactDrawer: (id) => set({ contactDrawerId: id }),
  closeContactDrawer: () => set({ contactDrawerId: null }),

  orgDrawerId: null,
  openOrgDrawer: (id) => set({ orgDrawerId: id }),
  closeOrgDrawer: () => set({ orgDrawerId: null }),

  mobileNavOpen: false,
  openMobileNav: () => set({ mobileNavOpen: true }),
  closeMobileNav: () => set({ mobileNavOpen: false }),

  // Always starts open — this must match on both the server-rendered HTML
  // and the client's first render, or Next.js logs a hydration mismatch and
  // (per its own warning) leaves the mismatched attributes unpatched, so the
  // real saved value never actually applies visually. The real, possibly
  // different saved value is applied via hydrateDesktopSidebar() below,
  // called from a useEffect (i.e. strictly after hydration finishes) —
  // that's a normal post-mount update, not a hydration diff, so it repaints
  // correctly. This trades a one-frame flash of "open" for a working toggle.
  desktopSidebarOpen: true,
  toggleDesktopSidebar: () =>
    set((s) => {
      const next = !s.desktopSidebarOpen
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(SIDEBAR_STORAGE_KEY, next ? '1' : '0')
      }
      return { desktopSidebarOpen: next }
    }),
  hydrateDesktopSidebar: () => {
    if (typeof window === 'undefined') return
    const stored = window.localStorage.getItem(SIDEBAR_STORAGE_KEY)
    if (stored !== null) set({ desktopSidebarOpen: stored === '1' })
  },

  toasts: [],
  showToast: (message) => {
    const id = ++toastId
    set((s) => ({ toasts: [...s.toasts, { id, message }] }))
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 2200)
  },
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))
