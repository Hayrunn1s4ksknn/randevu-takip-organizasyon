import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ComingSoon } from '@/components/coming-soon'

describe('ComingSoon', () => {
  it('renders the given title', () => {
    render(<ComingSoon title="Kişiler" />)
    expect(screen.getByText('Kişiler')).toBeInTheDocument()
  })
})
