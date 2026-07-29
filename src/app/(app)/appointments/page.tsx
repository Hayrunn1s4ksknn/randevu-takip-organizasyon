import Link from 'next/link'
import { getAppointmentsList, getAppointmentsForExport } from '@/services/appointments'
import { getOrganizationOptions } from '@/services/organizations'
import { getContactOptions } from '@/services/contacts'
import { getStaffOptions } from '@/services/profile'
import { AppointmentFilters } from '@/features/appointments/appointment-filters'
import { AppointmentsTable } from '@/features/appointments/appointments-table'
import { ExportCsvButton } from '@/features/appointments/export-csv-button'
import { ExportExcelButton } from '@/features/appointments/export-excel-button'
import { NewAppointmentButton } from '@/features/appointments/new-appointment-button'
import type { AppointmentStatus } from '@/types/database'

const PAGE_SIZE = 5

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string
    status?: string
    org?: string
    page?: string
    dateFrom?: string
    dateTo?: string
    contact?: string
    assigned?: string
  }>
}) {
  const params = await searchParams
  const filters = {
    search: params.q,
    status: (params.status as AppointmentStatus | 'all' | undefined) ?? 'all',
    orgId: params.org && params.org !== 'all' ? Number(params.org) : undefined,
    dateFrom: params.dateFrom || undefined,
    dateTo: params.dateTo || undefined,
    contactId: params.contact && params.contact !== 'all' ? Number(params.contact) : undefined,
    assignedTo: params.assigned && params.assigned !== 'all' ? params.assigned : undefined,
  }
  const page = Math.max(1, Number(params.page) || 1)

  const [{ rows, totalCount }, exportRows, orgOptions, contactOptions, staffOptions] = await Promise.all([
    getAppointmentsList(filters, page, PAGE_SIZE),
    getAppointmentsForExport(filters),
    getOrganizationOptions(),
    getContactOptions(),
    getStaffOptions(),
  ])

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))
  const rangeStart = totalCount === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const rangeEnd = Math.min(page * PAGE_SIZE, totalCount)

  function pageHref(nextPage: number) {
    const sp = new URLSearchParams()
    if (params.q) sp.set('q', params.q)
    if (params.status) sp.set('status', params.status)
    if (params.org) sp.set('org', params.org)
    if (params.dateFrom) sp.set('dateFrom', params.dateFrom)
    if (params.dateTo) sp.set('dateTo', params.dateTo)
    if (params.contact) sp.set('contact', params.contact)
    if (params.assigned) sp.set('assigned', params.assigned)
    sp.set('page', String(nextPage))
    return `/appointments?${sp.toString()}`
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2.5">
        <AppointmentFilters
          orgOptions={orgOptions}
          contactOptions={contactOptions}
          staffOptions={staffOptions}
        />
        <div className="flex gap-2">
          <ExportCsvButton rows={exportRows} />
          <ExportExcelButton rows={exportRows} />
          <NewAppointmentButton />
        </div>
      </div>

      <AppointmentsTable rows={rows} />

      <div className="mt-3 flex items-center justify-between text-[12.5px] text-text-secondary">
        <div>
          {totalCount} sonuçtan {rangeStart}-{rangeEnd} gösteriliyor
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={pageHref(Math.max(1, page - 1))}
            className="rounded-lg border border-border px-3 py-1.5"
            aria-disabled={page <= 1}
          >
            ‹
          </Link>
          <div>
            Sayfa {page} / {totalPages}
          </div>
          <Link
            href={pageHref(Math.min(totalPages, page + 1))}
            className="rounded-lg border border-border px-3 py-1.5"
            aria-disabled={page >= totalPages}
          >
            ›
          </Link>
        </div>
      </div>
    </div>
  )
}
