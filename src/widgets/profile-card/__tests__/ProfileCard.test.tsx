import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.hoisted(() => {
  vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.test')
})

import { he } from '@/shared/i18n/he'
import { ProfileCard } from '..'

const URL_USER = 'https://api.example.test/users/7'

const SENSITIVE = {
  password: 'S3cret-pass-9f2',
  ssn: '900-11-2233',
  bank: { cardNumber: '4111111111119999', iban: 'GB33BUKB20201555555555' },
  ip: '203.0.113.77',
  macAddress: '3c:22:fb:aa:bb:cc',
  crypto: { wallet: '0xDEADBEEFWALLET' },
}

function userBody(overrides: Record<string, unknown> = {}) {
  return {
    id: 7,
    firstName: 'Emily',
    lastName: 'Johnson',
    phone: '+81 965-431-3024',
    email: 'emily.johnson@x.dummyjson.com',
    image: 'https://cdn.example.test/emily.png',
    address: { city: 'Phoenix', address: '626 Main Street' },
    ...SENSITIVE,
    ...overrides,
  }
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status })
}

type FetchFn = (url: string, init?: RequestInit) => Promise<Response>

function stubFetch() {
  const fetchMock = vi.fn<FetchFn>()
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('ProfileCard', () => {
  it('shows full name and the four labelled values, and no sensitive data', async () => {
    stubFetch().mockResolvedValue(jsonResponse(userBody()))
    render(<ProfileCard customerId={7} />)

    expect(await screen.findByText('Emily Johnson')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: he.profileCard.title })).toBeInTheDocument()
    expect(screen.getByText(he.profileCard.fields.id)).toBeInTheDocument()
    expect(screen.getByText('7')).toBeInTheDocument()
    expect(screen.getByText(he.profileCard.fields.phone)).toBeInTheDocument()
    expect(screen.getByText('+81 965-431-3024')).toHaveAttribute('dir', 'ltr')
    expect(screen.getByText(he.profileCard.fields.email)).toBeInTheDocument()
    expect(screen.getByText('emily.johnson@x.dummyjson.com')).toHaveAttribute('dir', 'ltr')
    expect(screen.getByText(he.profileCard.fields.city)).toBeInTheDocument()
    expect(screen.getByText('Phoenix')).toBeInTheDocument()

    const text = document.body.innerHTML
    for (const secret of [
      SENSITIVE.password,
      SENSITIVE.ssn,
      SENSITIVE.bank.cardNumber,
      SENSITIVE.bank.iban,
      SENSITIVE.ip,
      SENSITIVE.macAddress,
      SENSITIVE.crypto.wallet,
      '626 Main Street',
    ]) {
      expect(text).not.toContain(secret)
    }
  })

  it('shows a labelled busy status while loading and no fields, then removes it', async () => {
    let resolve: (response: Response) => void = () => {}
    stubFetch().mockReturnValue(
      new Promise<Response>((r) => {
        resolve = r
      }),
    )
    render(<ProfileCard customerId={7} />)

    const status = screen.getByRole('status', { name: he.profileCard.loading })
    expect(status).toHaveAttribute('aria-busy', 'true')
    expect(screen.queryByText(he.profileCard.fields.phone)).not.toBeInTheDocument()
    expect(screen.queryByText('Emily Johnson')).not.toBeInTheDocument()

    resolve(jsonResponse(userBody()))
    expect(await screen.findByText('Emily Johnson')).toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('shows not-found without retry button or labels on 404', async () => {
    stubFetch().mockResolvedValue(jsonResponse({ message: 'nope' }, 404))
    render(<ProfileCard customerId={7} />)

    expect(await screen.findByText(he.states.notFound)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: he.states.retry })).not.toBeInTheDocument()
    expect(screen.queryByText(he.profileCard.fields.phone)).not.toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('shows an alert on 500 and retries with the same URL', async () => {
    const fetchMock = stubFetch()
    fetchMock.mockResolvedValueOnce(jsonResponse({}, 500))
    fetchMock.mockResolvedValueOnce(jsonResponse(userBody()))
    render(<ProfileCard customerId={7} />)

    expect(await screen.findByRole('alert')).toHaveTextContent(he.states.error)
    await userEvent.click(screen.getByRole('button', { name: he.states.retry }))

    expect(await screen.findByText('Emily Johnson')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(fetchMock.mock.calls[0]?.[0]).toBe(URL_USER)
    expect(fetchMock.mock.calls[1]?.[0]).toBe(URL_USER)
  })

  it('shows an alert on a network failure', async () => {
    stubFetch().mockRejectedValue(new TypeError('offline'))
    render(<ProfileCard customerId={7} />)

    expect(await screen.findByRole('alert')).toHaveTextContent(he.states.error)
    expect(screen.getByRole('button', { name: he.states.retry })).toBeInTheDocument()
  })

  it.each([
    ['no firstName', userBody({ firstName: undefined })],
    ['no address', userBody({ address: undefined })],
    ['phone is a number', userBody({ phone: 123456 })],
    ['array body', [userBody()]],
  ])('shows an alert with retry for a malformed body: %s', async (_name, body) => {
    stubFetch().mockResolvedValue(jsonResponse(body))
    render(<ProfileCard customerId={7} />)

    expect(await screen.findByRole('alert')).toHaveTextContent(he.states.error)
    expect(screen.getByRole('button', { name: he.states.retry })).toBeInTheDocument()
    expect(screen.queryByText(he.profileCard.fields.phone)).not.toBeInTheDocument()
  })

  it('shows an alert for a body that is not JSON', async () => {
    stubFetch().mockResolvedValue(new Response('<html>', { status: 200 }))
    render(<ProfileCard customerId={7} />)

    expect(await screen.findByRole('alert')).toHaveTextContent(he.states.error)
  })

  it('shows the avatar image for an https URL', async () => {
    stubFetch().mockResolvedValue(jsonResponse(userBody()))
    const { container } = render(<ProfileCard customerId={7} />)

    await screen.findByText('Emily Johnson')
    const image = container.querySelector('img')
    expect(image).not.toBeNull()
    expect(image).toHaveAttribute('src', 'https://cdn.example.test/emily.png')
    expect(screen.queryByText('EJ')).not.toBeInTheDocument()
  })

  it.each([
    ['http', 'http://cdn.example.test/a.png'],
    ['javascript', 'javascript:alert(1)'],
    ['data', 'data:image/png;base64,AAAA'],
    ['empty string', ''],
    ['missing field', undefined],
  ])('shows initials instead of an image for image: %s', async (_name, image) => {
    stubFetch().mockResolvedValue(jsonResponse(userBody({ image })))
    const { container } = render(<ProfileCard customerId={7} />)

    expect(await screen.findByText('EJ')).toBeInTheDocument()
    expect(container.querySelector('img')).toBeNull()
  })

  it('falls back to initials when the image fails to load', async () => {
    stubFetch().mockResolvedValue(jsonResponse(userBody()))
    const { container } = render(<ProfileCard customerId={7} />)

    await screen.findByText('Emily Johnson')
    const image = container.querySelector('img')
    if (!image) throw new Error('expected an image')
    fireEvent.error(image)

    await waitFor(() => expect(container.querySelector('img')).toBeNull())
    expect(screen.getByText('EJ')).toBeInTheDocument()
  })
})
