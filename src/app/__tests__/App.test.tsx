import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { customerPath, DEFAULT_CUSTOMER_ID } from '@/shared/config/routes'
import { he } from '@/shared/i18n/he'
import { AppRouter } from '../AppRouter'

// The customer page now loads data: keep the shell tests off the network.
beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn(() => new Promise<Response>(() => {})),
  )
})

afterEach(() => {
  vi.unstubAllGlobals()
})

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppRouter />
    </MemoryRouter>,
  )
}

function getNavLinks() {
  return within(screen.getByRole('navigation', { name: he.header.navLabel })).getAllByRole('link')
}

describe('App shell', () => {
  describe('root redirect (AC-1)', () => {
    it('redirects "/" to the customer page and shows its h1', () => {
      renderAt('/')

      expect(
        screen.getByRole('heading', { level: 1, name: he.customerPage.title }),
      ).toBeInTheDocument()
      expect(screen.getByRole('link', { name: he.header.nav.customers })).toHaveAttribute(
        'aria-current',
        'page',
      )
    })

    it('does not show the customer h1 on a section page', () => {
      renderAt('/claims')

      expect(
        screen.queryByRole('heading', { level: 1, name: he.customerPage.title }),
      ).not.toBeInTheDocument()
    })
  })

  describe('navigation (AC-2)', () => {
    it.each(['/', '/claims', '/history', '/nope'])('has three links in order at %s', (path) => {
      renderAt(path)

      expect(getNavLinks().map((link) => link.textContent)).toEqual([
        he.header.nav.customers,
        he.header.nav.claims,
        he.header.nav.history,
      ])
    })
  })

  describe('active item (AC-3)', () => {
    it('marks only "customers" active on /customers/1', () => {
      renderAt(customerPath(DEFAULT_CUSTOMER_ID))

      const [customers, claims, history] = getNavLinks()
      expect(customers).toHaveAttribute('aria-current', 'page')
      expect(claims).not.toHaveAttribute('aria-current')
      expect(history).not.toHaveAttribute('aria-current')
    })

    it('marks only "claims" active on /claims', () => {
      renderAt('/claims')

      const [customers, claims, history] = getNavLinks()
      expect(claims).toHaveAttribute('aria-current', 'page')
      expect(customers).not.toHaveAttribute('aria-current')
      expect(history).not.toHaveAttribute('aria-current')
    })

    it('keeps "customers" active on any /customers/... address', () => {
      renderAt(customerPath(42))

      expect(screen.getByRole('link', { name: he.header.nav.customers })).toHaveAttribute(
        'aria-current',
        'page',
      )
    })

    it('marks no item active on an unknown address', () => {
      renderAt('/nope')

      for (const link of getNavLinks()) {
        expect(link).not.toHaveAttribute('aria-current')
      }
    })
  })

  describe('section placeholders (AC-4)', () => {
    it.each([
      ['/claims', he.header.nav.claims],
      ['/history', he.header.nav.history],
    ])('shows the title and "coming soon" at %s', (path, title) => {
      renderAt(path)

      expect(screen.getByRole('heading', { level: 1, name: title })).toBeInTheDocument()
      expect(screen.getByText(he.comingSoon.text)).toBeInTheDocument()
    })

    it('does not show "coming soon" on the customer page', () => {
      renderAt(customerPath(DEFAULT_CUSTOMER_ID))

      expect(screen.queryByText(he.comingSoon.text)).not.toBeInTheDocument()
    })
  })

  describe('not found (AC-5)', () => {
    it('shows the not-found heading and a link back to the default customer', () => {
      renderAt('/nope')

      expect(screen.getByRole('heading', { level: 1, name: he.notFound.title })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: he.notFound.backLink })).toHaveAttribute(
        'href',
        customerPath(DEFAULT_CUSTOMER_ID),
      )
    })

    it('does not show the not-found heading on a known route', () => {
      renderAt('/history')

      expect(screen.queryByRole('heading', { name: he.notFound.title })).not.toBeInTheDocument()
    })
  })
})
