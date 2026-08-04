// Hand-authored to mirror supabase/migrations/*.sql. Regenerate with
// `npx supabase gen types typescript --linked > src/types/database.ts`
// once the Supabase CLI is authenticated against the linked project.

export type UserRole = 'admin' | 'yonetici' | 'personel' | 'misafir'
export type AppointmentStatus = 'Planlandı' | 'Devam Ediyor' | 'Tamamlandı' | 'İptal Edildi' | 'Ertelendi'
export type AppointmentPriority = 'Düşük' | 'Orta' | 'Yüksek'
export type TaskStatus = 'todo' | 'done'
export type MeetingType = 'Online' | 'Fiziksel' | 'Telefon'

type Profiles = {
  Row: {
    id: string
    full_name: string | null
    role: UserRole
    avatar_url: string | null
    dark_mode: boolean
    created_at: string
  }
  Insert: Partial<Profiles['Row']> & { id: string }
  Update: Partial<Profiles['Row']>
  Relationships: []
}

type Organizations = {
  Row: {
    id: number
    name: string
    sector: string | null
    logo_letter: string | null
    contact_person: string | null
    phone: string | null
    email: string | null
    address: string | null
    total_meetings: number
    deleted_at: string | null
    created_by: string | null
    created_at: string
  }
  Insert: Partial<Organizations['Row']> & { name: string }
  Update: Partial<Organizations['Row']>
  Relationships: [
    {
      foreignKeyName: 'organizations_created_by_fkey'
      columns: ['created_by']
      isOneToOne: false
      referencedRelation: 'profiles'
      referencedColumns: ['id']
    },
  ]
}

type Contacts = {
  Row: {
    id: number
    name: string
    position: string | null
    company_id: number | null
    phone: string | null
    email: string | null
    notes: string | null
    tags: string[]
    last_contact: string | null
    deleted_at: string | null
    created_by: string | null
    created_at: string
  }
  Insert: Partial<Contacts['Row']> & { name: string }
  Update: Partial<Contacts['Row']>
  Relationships: [
    {
      foreignKeyName: 'contacts_company_id_fkey'
      columns: ['company_id']
      isOneToOne: false
      referencedRelation: 'organizations'
      referencedColumns: ['id']
    },
    {
      foreignKeyName: 'contacts_created_by_fkey'
      columns: ['created_by']
      isOneToOne: false
      referencedRelation: 'profiles'
      referencedColumns: ['id']
    },
  ]
}

type Appointments = {
  Row: {
    id: number
    title: string
    org_id: number | null
    date: string
    time: string | null
    location: string | null
    status: AppointmentStatus
    priority: AppointmentPriority
    created_by: string | null
    created_at: string
    updated_at: string
    reminder_sent_at: string | null
    meeting_type: MeetingType | null
    duration_minutes: number | null
    assigned_to: string | null
  }
  Insert: Partial<Appointments['Row']> & { title: string; date: string }
  Update: Partial<Appointments['Row']>
  Relationships: [
    {
      foreignKeyName: 'appointments_org_id_fkey'
      columns: ['org_id']
      isOneToOne: false
      referencedRelation: 'organizations'
      referencedColumns: ['id']
    },
    {
      foreignKeyName: 'appointments_created_by_fkey'
      columns: ['created_by']
      isOneToOne: false
      referencedRelation: 'profiles'
      referencedColumns: ['id']
    },
    {
      foreignKeyName: 'appointments_assigned_to_fkey'
      columns: ['assigned_to']
      isOneToOne: false
      referencedRelation: 'profiles'
      referencedColumns: ['id']
    },
  ]
}

type AppointmentParticipants = {
  Row: { appointment_id: number; contact_id: number }
  Insert: { appointment_id: number; contact_id: number }
  Update: Partial<AppointmentParticipants['Row']>
  Relationships: [
    {
      foreignKeyName: 'appointment_participants_appointment_id_fkey'
      columns: ['appointment_id']
      isOneToOne: false
      referencedRelation: 'appointments'
      referencedColumns: ['id']
    },
    {
      foreignKeyName: 'appointment_participants_contact_id_fkey'
      columns: ['contact_id']
      isOneToOne: false
      referencedRelation: 'contacts'
      referencedColumns: ['id']
    },
  ]
}

type AppointmentNotes = {
  Row: { id: number; appointment_id: number; author_id: string | null; body: string; created_at: string }
  Insert: Partial<AppointmentNotes['Row']> & { appointment_id: number; body: string }
  Update: Partial<AppointmentNotes['Row']>
  Relationships: [
    {
      foreignKeyName: 'appointment_notes_appointment_id_fkey'
      columns: ['appointment_id']
      isOneToOne: false
      referencedRelation: 'appointments'
      referencedColumns: ['id']
    },
    {
      foreignKeyName: 'appointment_notes_author_id_fkey'
      columns: ['author_id']
      isOneToOne: false
      referencedRelation: 'profiles'
      referencedColumns: ['id']
    },
  ]
}

type AppointmentComments = {
  Row: { id: number; appointment_id: number; author_id: string | null; body: string; created_at: string }
  Insert: Partial<AppointmentComments['Row']> & { appointment_id: number; body: string }
  Update: Partial<AppointmentComments['Row']>
  Relationships: [
    {
      foreignKeyName: 'appointment_comments_appointment_id_fkey'
      columns: ['appointment_id']
      isOneToOne: false
      referencedRelation: 'appointments'
      referencedColumns: ['id']
    },
    {
      foreignKeyName: 'appointment_comments_author_id_fkey'
      columns: ['author_id']
      isOneToOne: false
      referencedRelation: 'profiles'
      referencedColumns: ['id']
    },
  ]
}

type AppointmentStatusHistory = {
  Row: {
    id: number
    appointment_id: number
    from_status: AppointmentStatus | null
    to_status: AppointmentStatus
    changed_by: string | null
    changed_at: string
  }
  Insert: Partial<AppointmentStatusHistory['Row']> & { appointment_id: number; to_status: AppointmentStatus }
  Update: Partial<AppointmentStatusHistory['Row']>
  Relationships: [
    {
      foreignKeyName: 'appointment_status_history_appointment_id_fkey'
      columns: ['appointment_id']
      isOneToOne: false
      referencedRelation: 'appointments'
      referencedColumns: ['id']
    },
    {
      foreignKeyName: 'appointment_status_history_changed_by_fkey'
      columns: ['changed_by']
      isOneToOne: false
      referencedRelation: 'profiles'
      referencedColumns: ['id']
    },
  ]
}

type Tasks = {
  Row: {
    id: number
    title: string
    description: string | null
    deadline: string | null
    priority: AppointmentPriority
    status: TaskStatus
    appointment_id: number | null
    assigned_to: string | null
    created_by: string | null
    created_at: string
  }
  Insert: Partial<Tasks['Row']> & { title: string }
  Update: Partial<Tasks['Row']>
  Relationships: [
    {
      foreignKeyName: 'tasks_created_by_fkey'
      columns: ['created_by']
      isOneToOne: false
      referencedRelation: 'profiles'
      referencedColumns: ['id']
    },
    {
      foreignKeyName: 'tasks_appointment_id_fkey'
      columns: ['appointment_id']
      isOneToOne: false
      referencedRelation: 'appointments'
      referencedColumns: ['id']
    },
    {
      foreignKeyName: 'tasks_assigned_to_fkey'
      columns: ['assigned_to']
      isOneToOne: false
      referencedRelation: 'profiles'
      referencedColumns: ['id']
    },
  ]
}

type AppointmentFiles = {
  Row: {
    id: number
    appointment_id: number
    uploaded_by: string | null
    file_name: string
    storage_path: string
    size_bytes: number
    mime_type: string | null
    created_at: string
  }
  Insert: Partial<AppointmentFiles['Row']> & {
    appointment_id: number
    file_name: string
    storage_path: string
    size_bytes: number
  }
  Update: Partial<AppointmentFiles['Row']>
  Relationships: [
    {
      foreignKeyName: 'appointment_files_appointment_id_fkey'
      columns: ['appointment_id']
      isOneToOne: false
      referencedRelation: 'appointments'
      referencedColumns: ['id']
    },
    {
      foreignKeyName: 'appointment_files_uploaded_by_fkey'
      columns: ['uploaded_by']
      isOneToOne: false
      referencedRelation: 'profiles'
      referencedColumns: ['id']
    },
  ]
}

type AuthAttempts = {
  Row: {
    id: number
    email: string
    action: 'login' | 'password_reset'
    success: boolean
    attempted_at: string
  }
  Insert: Partial<AuthAttempts['Row']> & {
    email: string
    action: 'login' | 'password_reset'
    success: boolean
  }
  Update: Partial<AuthAttempts['Row']>
  Relationships: []
}

type AppointmentEmails = {
  Row: {
    id: number
    appointment_id: number
    sent_by: string | null
    to_email: string
    subject: string
    body: string
    kind: 'manual' | 'confirmation' | 'reminder'
    sent_at: string
  }
  Insert: Partial<AppointmentEmails['Row']> & {
    appointment_id: number
    to_email: string
    subject: string
    body: string
    kind: 'manual' | 'confirmation' | 'reminder'
  }
  Update: Partial<AppointmentEmails['Row']>
  Relationships: [
    {
      foreignKeyName: 'appointment_emails_appointment_id_fkey'
      columns: ['appointment_id']
      isOneToOne: false
      referencedRelation: 'appointments'
      referencedColumns: ['id']
    },
    {
      foreignKeyName: 'appointment_emails_sent_by_fkey'
      columns: ['sent_by']
      isOneToOne: false
      referencedRelation: 'profiles'
      referencedColumns: ['id']
    },
  ]
}

type Activities = {
  Row: { id: number; user_id: string | null; action_type: string; description: string; created_at: string }
  Insert: Partial<Activities['Row']> & { action_type: string; description: string }
  Update: Partial<Activities['Row']>
  Relationships: [
    {
      foreignKeyName: 'activities_user_id_fkey'
      columns: ['user_id']
      isOneToOne: false
      referencedRelation: 'profiles'
      referencedColumns: ['id']
    },
  ]
}

export interface Database {
  public: {
    Tables: {
      profiles: Profiles
      organizations: Organizations
      contacts: Contacts
      appointments: Appointments
      appointment_participants: AppointmentParticipants
      appointment_notes: AppointmentNotes
      appointment_comments: AppointmentComments
      appointment_status_history: AppointmentStatusHistory
      appointment_files: AppointmentFiles
      appointment_emails: AppointmentEmails
      tasks: Tasks
      activities: Activities
      auth_attempts: AuthAttempts
    }
    Views: Record<string, never>
    Functions: Record<string, never>
  }
}
