import type { AppointmentPriority, AppointmentStatus } from '@/types/database'

export const STATUS_STYLE: Record<AppointmentStatus, { bg: string; color: string }> = {
  Tamamlandı: { bg: 'var(--color-success-bg)', color: '#15803D' },
  'İptal Edildi': { bg: 'var(--color-danger-bg)', color: '#B91C1C' },
  Planlandı: { bg: 'var(--color-accent-bg)', color: '#1D4ED8' },
  'Devam Ediyor': { bg: 'var(--color-warning-bg)', color: '#B45309' },
}

export const PRIORITY_STYLE: Record<AppointmentPriority, { bg: string; color: string }> = {
  Yüksek: { bg: 'var(--color-danger-bg)', color: '#B91C1C' },
  Orta: { bg: 'var(--color-warning-bg)', color: '#B45309' },
  Düşük: { bg: 'var(--color-accent-bg)', color: '#1D4ED8' },
}
