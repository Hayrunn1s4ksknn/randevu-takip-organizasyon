import { describe, expect, it } from 'vitest'
import { toCsvValue, toCsvRow } from '@/lib/csv'

describe('toCsvValue', () => {
  it('returns plain values unchanged', () => {
    expect(toCsvValue('Mersin Teknopark')).toBe('Mersin Teknopark')
  })

  it('quotes and escapes values containing commas, quotes, or newlines', () => {
    expect(toCsvValue('Acme, Inc.')).toBe('"Acme, Inc."')
    expect(toCsvValue('Say "hi"')).toBe('"Say ""hi"""')
    expect(toCsvValue('line1\nline2')).toBe('"line1\nline2"')
  })
})

describe('toCsvRow', () => {
  it('joins escaped values with commas', () => {
    expect(toCsvRow(['a', 'b, c', 'd'])).toBe('a,"b, c",d')
  })
})
