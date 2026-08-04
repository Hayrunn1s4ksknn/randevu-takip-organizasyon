'use client'

import { useRef, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateUserRole, setUserBanned, deleteUser } from './user-management-actions'
import { useUiStore } from '@/store/ui'
import type { UserListItem } from '@/services/users'

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  yonetici: 'Yönetici',
  personel: 'Personel',
  misafir: 'Misafir',
}

export function UserRow({ user, isSelf }: { user: UserListItem; isSelf: boolean }) {
  const router = useRouter()
  const showToast = useUiStore((s) => s.showToast)
  const [pending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)

  function handleRoleChange() {
    if (!formRef.current) return
    const formData = new FormData(formRef.current)
    startTransition(async () => {
      const result = await updateUserRole(user.id, undefined, formData)
      if (result?.error) showToast(result.error)
      else {
        showToast('Rol güncellendi')
        router.refresh()
      }
    })
  }

  function handleToggleBan() {
    const confirmMsg = user.banned
      ? `"${user.full_name ?? user.email}" kullanıcısını yeniden etkinleştirmek istediğine emin misin?`
      : `"${user.full_name ?? user.email}" kullanıcısını devre dışı bırakmak istediğine emin misin?`
    if (!confirm(confirmMsg)) return
    startTransition(async () => {
      try {
        await setUserBanned(user.id, !user.banned)
        showToast(user.banned ? 'Kullanıcı etkinleştirildi' : 'Kullanıcı devre dışı bırakıldı')
        router.refresh()
      } catch (e) {
        showToast(e instanceof Error ? e.message : 'İşlem başarısız oldu.')
      }
    })
  }

  function handleDelete() {
    if (
      !confirm(
        `"${user.full_name ?? user.email}" kullanıcısını kalıcı olarak silmek istediğine emin misin? Bu işlem geri alınamaz.`
      )
    )
      return
    startTransition(async () => {
      try {
        await deleteUser(user.id)
        showToast('Kullanıcı silindi')
        router.refresh()
      } catch (e) {
        showToast(e instanceof Error ? e.message : 'İşlem başarısız oldu.')
      }
    })
  }

  const initials = (user.full_name ?? user.email)
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-surface-solid p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-[13px] font-bold text-white">
        {initials}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13.5px] font-bold">
          {user.full_name ?? user.email} {isSelf && <span className="text-text-secondary">(sen)</span>}
        </div>
        <div className="truncate text-[12px] text-text-secondary">{user.email}</div>
      </div>
      {user.banned && (
        <span className="shrink-0 rounded-md bg-danger-bg px-2 py-0.5 text-[10.5px] font-bold text-danger">
          Devre dışı
        </span>
      )}
      <form ref={formRef} className="shrink-0">
        <select
          name="role"
          defaultValue={user.role}
          disabled={isSelf || pending}
          onChange={handleRoleChange}
          className="rounded-[9px] border border-border bg-bg px-2.5 py-1.5 text-[12.5px] disabled:opacity-60"
        >
          {Object.entries(ROLE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </form>
      <button
        onClick={handleToggleBan}
        disabled={isSelf || pending}
        className="shrink-0 rounded-[9px] border px-3 py-1.5 text-[12px] font-bold disabled:opacity-50"
        style={{
          borderColor: user.banned ? 'var(--color-success)' : 'var(--color-danger)',
          color: user.banned ? 'var(--color-success)' : 'var(--color-danger)',
        }}
      >
        {user.banned ? 'Etkinleştir' : 'Devre Dışı Bırak'}
      </button>
      <button
        onClick={handleDelete}
        disabled={isSelf || pending}
        className="shrink-0 rounded-[9px] border border-danger px-3 py-1.5 text-[12px] font-bold text-danger disabled:opacity-50"
      >
        Sil
      </button>
    </div>
  )
}
