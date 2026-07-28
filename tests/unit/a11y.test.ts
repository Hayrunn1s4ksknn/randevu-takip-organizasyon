import { describe, expect, it, vi } from 'vitest'
import { onActivateKey } from '@/lib/a11y'

function keyEvent(key: string) {
  return { key, preventDefault: vi.fn() } as unknown as React.KeyboardEvent
}

describe('onActivateKey', () => {
  it('calls the handler and prevents default on Enter', () => {
    const handler = vi.fn()
    const event = keyEvent('Enter')
    onActivateKey(handler)(event)
    expect(handler).toHaveBeenCalledOnce()
    expect(event.preventDefault).toHaveBeenCalledOnce()
  })

  it('calls the handler and prevents default on Space', () => {
    const handler = vi.fn()
    const event = keyEvent(' ')
    onActivateKey(handler)(event)
    expect(handler).toHaveBeenCalledOnce()
    expect(event.preventDefault).toHaveBeenCalledOnce()
  })

  it('ignores other keys', () => {
    const handler = vi.fn()
    const event = keyEvent('Tab')
    onActivateKey(handler)(event)
    expect(handler).not.toHaveBeenCalled()
    expect(event.preventDefault).not.toHaveBeenCalled()
  })
})
