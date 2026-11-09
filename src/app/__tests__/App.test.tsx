import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { he } from '@/shared/i18n/he'
import { App } from '../App'

describe('App (starter)', () => {
  it('renders the application title from the dictionary', () => {
    render(<App />)

    expect(screen.getByRole('heading', { level: 1, name: he.app.title })).toBeInTheDocument()
  })
})
