import { create } from 'zustand'

type Toast = { id: number; message: string }
export type ModalKey =
  'appointment' | 'contact' | 'organization' | 'task' | 'edit-contact' | 'edit-organization' | null

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

  toasts: [],
  showToast: (message) => {
    const id = ++toastId
    set((s) => ({ toasts: [...s.toasts, { id, message }] }))
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 2200)
  },
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))
