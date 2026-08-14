// Turkey has used a fixed UTC+3 offset with no DST since 2016, so a flat
// offset is always safe here — no need for Intl/timezone-database lookups.
const TR_OFFSET_MS = 3 * 60 * 60 * 1000

// appointments.time / .date are entered (and stored, with no timezone) as
// Turkey local time — but Vercel's serverless functions run in UTC.
// Comparing a UTC-based `now` against those naive local values would
// silently miss every appointment by ~3 hours (this happened for real: the
// SMS reminder cron shipped with this bug and matched zero appointments
// until it was caught in production testing).
export function nowInTurkey(referenceUtcMs: number = Date.now()): Date {
  return new Date(referenceUtcMs + TR_OFFSET_MS)
}

export function turkeyDateISO(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function turkeyTimeHHMMSS(date: Date): string {
  return date.toISOString().slice(11, 19)
}

// The window an appointment's `time` must fall within, right now, to be
// "starting within the next `windowMinutes` minutes" in Turkey local time.
export function reminderWindow(windowMinutes: number, referenceUtcMs: number = Date.now()) {
  const nowTR = nowInTurkey(referenceUtcMs)
  const windowEndTR = new Date(nowTR.getTime() + windowMinutes * 60 * 1000)
  return {
    todayISO: turkeyDateISO(nowTR),
    nowHHMMSS: turkeyTimeHHMMSS(nowTR),
    windowEndHHMMSS: turkeyTimeHHMMSS(windowEndTR),
  }
}
