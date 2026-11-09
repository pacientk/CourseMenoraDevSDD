import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { he } from '@/shared/i18n/he'
import { StatusBadge } from '../StatusBadge'

describe('StatusBadge', () => {
  it('shows the text for the warning tone', () => {
    render(<StatusBadge tone="warning">{he.customerTasks.status.open}</StatusBadge>)
    expect(screen.getByText(he.customerTasks.status.open)).toBeInTheDocument()
    expect(screen.queryByText(he.customerTasks.status.done)).not.toBeInTheDocument()
  })

  it('shows the text for the success tone', () => {
    render(<StatusBadge tone="success">{he.customerTasks.status.done}</StatusBadge>)
    expect(screen.getByText(he.customerTasks.status.done)).toBeInTheDocument()
    expect(screen.queryByText(he.customerTasks.status.open)).not.toBeInTheDocument()
  })
})
