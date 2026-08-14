import { describe, expect, it } from 'vitest'
import { normalizeTurkishPhone } from '@/lib/phone'

describe('normalizeTurkishPhone', () => {
  it('normalizes a bare 10-digit number starting with 5', () => {
    expect(normalizeTurkishPhone('5321112233')).toBe('905321112233')
  })

  it('normalizes an 11-digit number with a leading 0', () => {
    expect(normalizeTurkishPhone('05321112233')).toBe('905321112233')
  })

  it('normalizes a number already prefixed with the 90 country code', () => {
    expect(normalizeTurkishPhone('905321112233')).toBe('905321112233')
  })

  it('strips spaces, dashes, parentheses and a leading +', () => {
    expect(normalizeTurkishPhone('+90 532 111 22 33')).toBe('905321112233')
    expect(normalizeTurkishPhone('0532 111 22 33')).toBe('905321112233')
    expect(normalizeTurkishPhone('(0532) 111-22-33')).toBe('905321112233')
  })

  it('rejects numbers that are too short or too long', () => {
    expect(normalizeTurkishPhone('123')).toBeNull()
    expect(normalizeTurkishPhone('123456789012345')).toBeNull()
  })

  it('rejects a 10-digit number that does not start with 5', () => {
    expect(normalizeTurkishPhone('1234567890')).toBeNull()
  })

  it('rejects empty input', () => {
    expect(normalizeTurkishPhone('')).toBeNull()
  })
})
