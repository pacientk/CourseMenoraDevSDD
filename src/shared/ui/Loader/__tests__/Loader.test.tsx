import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { he } from '@/shared/i18n/he'
import { Loader } from '../Loader'

describe('Loader', () => {
  it('exposes a busy status with the label', () => {
    render(<Loader label={he.profileCard.loading} />)
    const status = screen.getByRole('status', { name: he.profileCard.loading })
    expect(status).toHaveAttribute('aria-busy', 'true')
    expect(status).toHaveTextContent(he.profileCard.loading)
  })

  it('does not show another label', () => {
    render(<Loader label={he.profileCard.loading} />)
    expect(screen.queryByText(he.customerTasks.loading)).not.toBeInTheDocument()
  })
})
