import { create } from 'zustand'

type Toast = { id: number; message: string }
export type ModalKey = 'appointment' | 'contact' | 'organization' | 'task' | null

interface UiState {
  searchOpen: boolean
  openSearch: () => void
  closeSearch: () => void

  activeModal: ModalKey
  openModal: (key: ModalKey) => void
  closeModal: () => void

  drawerApptId: number | null
  openDrawer: (id: number) => void
  closeDrawer: () => void

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
  openModal: (key) => set({ activeModal: key }),
  closeModal: () => set({ activeModal: null }),

  drawerApptId: null,
  openDrawer: (id) => set({ drawerApptId: id }),
  closeDrawer: () => set({ drawerApptId: null }),

  toasts: [],
  showToast: (message) => {
    const id = ++toastId
    set((s) => ({ toasts: [...s.toasts, { id, message }] }))
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 2200)
  },
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))
