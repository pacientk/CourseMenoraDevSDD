import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { he } from '@/shared/i18n/he'
import { Card } from '../Card'

describe('Card', () => {
  it('renders the title as a level 2 heading and the content', () => {
    render(
      <Card title={he.profileCard.title}>
        <p>{he.customerTasks.empty}</p>
      </Card>,
    )
    expect(screen.getByRole('heading', { level: 2, name: he.profileCard.title })).toBeInTheDocument()
    expect(screen.getByText(he.customerTasks.empty)).toBeInTheDocument()
  })

  it('does not render a heading with another name', () => {
    render(<Card title={he.profileCard.title}>x</Card>)
    expect(screen.queryByRole('heading', { name: he.customerTasks.title })).not.toBeInTheDocument()
  })
})
