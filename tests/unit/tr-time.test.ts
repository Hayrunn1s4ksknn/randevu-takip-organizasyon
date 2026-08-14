import { describe, expect, it } from 'vitest'
import { nowInTurkey, reminderWindow, turkeyDateISO, turkeyTimeHHMMSS } from '@/lib/tr-time'

// Regression coverage for a real production bug: the SMS reminder cron
// compared UTC server time directly against Turkey-local appointment times
// with no offset, so it silently matched zero appointments until caught in
// a live test. These tests pin the +3h conversion so it can't regress
// unnoticed again.

describe('nowInTurkey', () => {
  it('adds a 3 hour offset to UTC', () => {
    const utcMs = Date.UTC(2026, 7, 12, 12, 15, 0) // 12:15:00 UTC
    const tr = nowInTurkey(utcMs)
    expect(tr.toISOString()).toBe('2026-08-12T15:15:00.000Z')
  })

  it('rolls over to the next calendar day when UTC is near midnight', () => {
    const utcMs = Date.UTC(2026, 7, 12, 22, 0, 0) // 22:00 UTC -> 01:00 TR next day
    const tr = nowInTurkey(utcMs)
    expect(turkeyDateISO(tr)).toBe('2026-08-13')
    expect(turkeyTimeHHMMSS(tr)).toBe('01:00:00')
  })
})

describe('reminderWindow', () => {
  it('computes a 60-minute window starting from the Turkey-local current time', () => {
    const utcMs = Date.UTC(2026, 7, 12, 12, 17, 19) // 15:17:19 TR
    const window = reminderWindow(60, utcMs)
    expect(window.todayISO).toBe('2026-08-12')
    expect(window.nowHHMMSS).toBe('15:17:19')
    expect(window.windowEndHHMMSS).toBe('16:17:19')
  })

  it('matches the exact scenario that failed before the timezone fix', () => {
    // The bug: an appointment stored as "15:19:00" (Turkey local) was
    // compared against raw UTC "12:15" and fell outside every window.
    const utcMs = Date.UTC(2026, 7, 12, 12, 15, 0)
    const window = reminderWindow(60, utcMs)
    const appointmentTime = '15:19:00'
    expect(appointmentTime >= window.nowHHMMSS && appointmentTime <= window.windowEndHHMMSS).toBe(true)
  })
})
