'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Modal } from '@/components/modal'
import { NewUserForm } from './new-user-form'
import { UserRow } from './user-row'
import type { UserListItem } from '@/services/users'

export function UsersPageClient({ users, currentUserId }: { users: UserListItem[]; currentUserId: string }) {
  const [modalOpen, setModalOpen] = useState(false)
  const router = useRouter()

  function handleDone() {
    setModalOpen(false)
    router.refresh()
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-2.5">
        <Link href="/settings" className="text-[13px] font-semibold text-text-secondary hover:underline">
          ← Ayarlar
        </Link>
        <button
          onClick={() => setModalOpen(true)}
          className="rounded-[9px] bg-primary px-4 py-[9px] text-[12.5px] font-bold text-white"
        >
          + Yeni Kullanıcı
        </button>
      </div>

      <div className="flex flex-col gap-2.5">
        {users.map((u) => (
          <UserRow key={u.id} user={u} isSelf={u.id === currentUserId} />
        ))}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Yeni Kullanıcı">
        <NewUserForm onDone={handleDone} />
      </Modal>
    </>
  )
}
