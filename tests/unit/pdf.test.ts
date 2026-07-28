import { describe, expect, it } from 'vitest'
import { pdfSafe } from '@/lib/pdf'

describe('pdfSafe', () => {
  it('transliterates ğ/ı/ş/İ/Ğ/Ş to their closest Latin equivalent', () => {
    expect(pdfSafe('Boğaziçi Üniversitesi ığş İĞŞ çöü')).toBe('Bogaziçi Üniversitesi igs IGS çöü')
  })

  it('leaves text without those letters unchanged', () => {
    expect(pdfSafe('Mersin Teknopark')).toBe('Mersin Teknopark')
  })

  it('leaves ç/ö/ü untouched since standard PDF fonts render them fine', () => {
    expect(pdfSafe('çöü ÇÖÜ')).toBe('çöü ÇÖÜ')
  })
})
