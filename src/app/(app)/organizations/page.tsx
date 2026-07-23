import { getOrganizationsList } from '@/services/organizations'
import { OrganizationSearch } from '@/features/organizations/organization-search'
import { OrganizationsGrid } from '@/features/organizations/organizations-grid'
import { NewOrganizationButton } from '@/features/organizations/new-organization-button'

export default async function OrganizationsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams
  const organizations = await getOrganizationsList(q)

  return (
    <div className="animate-fade-in">
      <div className="mb-4 flex justify-between gap-2.5">
        <OrganizationSearch />
        <NewOrganizationButton />
      </div>
      <OrganizationsGrid organizations={organizations} />
    </div>
  )
}
