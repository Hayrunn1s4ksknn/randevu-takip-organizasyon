import { getContactsList } from '@/services/contacts'
import { ContactSearch } from '@/features/contacts/contact-search'
import { ContactsGrid } from '@/features/contacts/contacts-grid'
import { NewContactButton } from '@/features/contacts/new-contact-button'

export default async function ContactsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams
  const contacts = await getContactsList(q)

  return (
    <div className="animate-fade-in">
      <div className="mb-4 flex justify-between gap-2.5">
        <ContactSearch />
        <NewContactButton />
      </div>
      <ContactsGrid contacts={contacts} />
    </div>
  )
}
