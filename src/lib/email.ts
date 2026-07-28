import 'server-only'
import { Resend } from 'resend'

const FROM = process.env.EMAIL_FROM ?? 'Randevu Paneli <onboarding@resend.dev>'

function getClient() {
  if (!process.env.RESEND_API_KEY) return null
  return new Resend(process.env.RESEND_API_KEY)
}

// Without a verified sending domain in Resend, emails can only reach the
// Resend account's own address or their test inbox — real recipients will
// get a 422 until EMAIL_FROM is switched to a verified domain.
export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const resend = getClient()
  if (!resend) throw new Error('RESEND_API_KEY tanımlı değil.')

  const { error } = await resend.emails.send({ from: FROM, to, subject, html })
  if (error) throw new Error(error.message)
}
