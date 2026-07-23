'use client'

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}) {
  if (!open) return null

  return (
    <div onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-5">
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[88vh] w-[440px] max-w-[92vw] overflow-auto rounded-2xl bg-surface-solid p-6 shadow-2xl"
      >
        <div className="mb-4 text-base font-bold text-text-primary">{title}</div>
        {children}
      </div>
    </div>
  )
}

export const modalInputClass =
  'w-full rounded-[9px] border border-border bg-bg px-3.5 py-2.5 text-[13px] text-text-primary outline-none focus:border-accent'

export function ModalActions({
  onCancel,
  submitLabel,
  pending,
}: {
  onCancel: () => void
  submitLabel: string
  pending?: boolean
}) {
  return (
    <div className="mt-5 flex justify-end gap-2.5">
      <button
        type="button"
        onClick={onCancel}
        className="rounded-[9px] border border-border px-4 py-2.5 text-[13px] font-semibold"
      >
        Vazgeç
      </button>
      <button
        type="submit"
        disabled={pending}
        className="rounded-[9px] bg-primary px-[18px] py-2.5 text-[13px] font-bold text-white disabled:opacity-60"
      >
        {submitLabel}
      </button>
    </div>
  )
}
