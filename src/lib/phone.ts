// Accepts local Turkish formats ("0532 111 22 33", "5321112233",
// "+90 532 111 22 33") and normalizes to NetGSM's expected "90XXXXXXXXXX".
// Kept separate from src/lib/sms.ts (which is 'server-only' and makes real
// network calls) so this pure logic can be unit tested without pulling in
// that restriction.
export function normalizeTurkishPhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 10 && digits.startsWith('5')) return `90${digits}`
  if (digits.length === 11 && digits.startsWith('05')) return `90${digits.slice(1)}`
  if (digits.length === 12 && digits.startsWith('90')) return digits
  return null
}
