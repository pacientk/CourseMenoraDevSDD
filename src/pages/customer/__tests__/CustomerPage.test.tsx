import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Link, MemoryRouter, Route, Routes } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.hoisted(() => {
  vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.test')
})

import { customerPath, ROUTES } from '@/shared/config/routes'
import { he } from '@/shared/i18n/he'
import { CustomerPage } from '..'

const BASE = 'https://api.example.test'

const SENSITIVE = { password: 'S3cret-pass-9f2', ssn: '900-11-2233' }

function userBody(id: number, firstName: string) {
  return {
    id,
    firstName,
    lastName: 'Tester',
    phone: '+1 555-000-0000',
    email: `${firstName.toLowerCase()}@x.test`,
    address: { city: 'Phoenix' },
    ...SENSITIVE,
  }
}

function todosBody(id: number, text: string) {
  return { todos: [{ id, todo: text, completed: false, userId: id }], total: 1, skip: 0, limit: 30 }
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status })
}

type FetchFn = (url: string, init?: RequestInit) => Promise<Response>

function stubFetch(impl: FetchFn) {
  const fetchMock = vi.fn<FetchFn>(impl)
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Link to={customerPath(2)} aria-label={customerPath(2)} />
      <Routes>
        <Route path={ROUTES.customer} element={<CustomerPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('CustomerPage', () => {
  describe('id parsing (AC-1)', () => {
    it.each(['abc', '0', '-1', '1.5', '007'])(
      'shows not-found and sends no request for /customers/%s',
      (segment) => {
        const fetchMock = stubFetch(() => new Promise<Response>(() => {}))
        renderAt(`/customers/${segment}`)

        expect(screen.getByText(he.states.notFound)).toBeInTheDocument()
        expect(
          screen.getByRole('heading', { level: 1, name: he.customerPage.title }),
        ).toBeInTheDocument()
        expect(screen.queryByRole('heading', { name: he.profileCard.title })).not.toBeInTheDocument()
        expect(screen.queryByRole('heading', { name: he.customerTasks.title })).not.toBeInTheDocument()
        expect(fetchMock).not.toHaveBeenCalled()
      },
    )

    it('requests both resources for /customers/1 and shows both cards', () => {
      const fetchMock = stubFetch(() => new Promise<Response>(() => {}))
      renderAt('/customers/1')

      expect(screen.queryByText(he.states.notFound)).not.toBeInTheDocument()
      expect(screen.getByRole('heading', { name: he.profileCard.title })).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: he.customerTasks.title })).toBeInTheDocument()
      const urls = fetchMock.mock.calls.map((call) => call[0])
      expect(urls).toContain(`${BASE}/users/1`)
      expect(urls).toContain(`${BASE}/users/1/todos`)
    })
  })

  describe('independent cards (AC-2)', () => {
    it('keeps the profile when tasks fail and retries only the tasks', async () => {
      let tasksFail = true
      const fetchMock = stubFetch((url) => {
        if (url === `${BASE}/users/1`) return Promise.resolve(jsonResponse(userBody(1, 'Emily')))
        if (tasksFail) return Promise.resolve(jsonResponse({}, 500))
        return Promise.resolve(jsonResponse(todosBody(5, 'Call back')))
      })
      renderAt('/customers/1')

      expect(await screen.findByText('Emily Tester')).toBeInTheDocument()
      const alert = await screen.findByRole('alert')
      expect(alert).toHaveTextContent(he.states.error)
      expect(screen.getAllByRole('alert')).toHaveLength(1)

      tasksFail = false
      const callsBefore = fetchMock.mock.calls.length
      await userEvent.click(screen.getByRole('button', { name: he.states.retry }))

      expect(await screen.findByText('Call back')).toBeInTheDocument()
      const newUrls = fetchMock.mock.calls.slice(callsBefore).map((call) => call[0])
      expect(newUrls).toEqual([`${BASE}/users/1/todos`])
      expect(screen.getByText('Emily Tester')).toBeInTheDocument()
    })

    it('keeps the tasks when the profile fails and retries only the profile', async () => {
      let profileFails = true
      const fetchMock = stubFetch((url) => {
        if (url === `${BASE}/users/1`) {
          return Promise.resolve(
            profileFails ? jsonResponse({}, 500) : jsonResponse(userBody(1, 'Emily')),
          )
        }
        return Promise.resolve(jsonResponse(todosBody(5, 'Call back')))
      })
      renderAt('/customers/1')

      expect(await screen.findByText('Call back')).toBeInTheDocument()
      expect(await screen.findByRole('alert')).toHaveTextContent(he.states.error)
      expect(screen.getAllByRole('alert')).toHaveLength(1)

      profileFails = false
      const callsBefore = fetchMock.mock.calls.length
      await userEvent.click(screen.getByRole('button', { name: he.states.retry }))

      expect(await screen.findByText('Emily Tester')).toBeInTheDocument()
      const newUrls = fetchMock.mock.calls.slice(callsBefore).map((call) => call[0])
      expect(newUrls).toEqual([`${BASE}/users/1`])
      expect(screen.getByText('Call back')).toBeInTheDocument()
    })
  })

  describe('switching customers', () => {
    function controlledFetch() {
      const pending = new Map<
        string,
        { resolve: (response: Response) => void; signal: AbortSignal | undefined }
      >()
      const fetchMock = stubFetch(
        (url, init) =>
          new Promise<Response>((resolve) => {
            pending.set(url, { resolve, signal: init?.signal ?? undefined })
          }),
      )
      return { pending, fetchMock }
    }

    it('shows customer 2 in both cards when the late response of customer 1 arrives (AC-3)', async () => {
      const { pending } = controlledFetch()
      renderAt('/customers/1')
      await userEvent.click(screen.getByRole('link', { name: customerPath(2) }))

      const user1 = pending.get(`${BASE}/users/1`)
      const tasks1 = pending.get(`${BASE}/users/1/todos`)
      expect(user1?.signal?.aborted).toBe(true)
      expect(tasks1?.signal?.aborted).toBe(true)

      await act(async () => {
        pending.get(`${BASE}/users/2`)?.resolve(jsonResponse(userBody(2, 'Bob')))
        pending.get(`${BASE}/users/2/todos`)?.resolve(jsonResponse(todosBody(9, 'Task two')))
      })
      await act(async () => {
        user1?.resolve(jsonResponse(userBody(1, 'Emily')))
        tasks1?.resolve(jsonResponse(todosBody(5, 'Task one')))
      })

      expect(await screen.findByText('Bob Tester')).toBeInTheDocument()
      expect(screen.getByText('Task two')).toBeInTheDocument()
      expect(screen.queryByText('Emily Tester')).not.toBeInTheDocument()
      expect(screen.queryByText('Task one')).not.toBeInTheDocument()
    })

    it('hides customer 1 data and shows loaders while customer 2 loads (AC-4)', async () => {
      const { pending } = controlledFetch()
      renderAt('/customers/1')
      await act(async () => {
        pending.get(`${BASE}/users/1`)?.resolve(jsonResponse(userBody(1, 'Emily')))
        pending.get(`${BASE}/users/1/todos`)?.resolve(jsonResponse(todosBody(5, 'Task one')))
      })
      expect(await screen.findByText('Emily Tester')).toBeInTheDocument()

      await userEvent.click(screen.getByRole('link', { name: customerPath(2) }))

      expect(screen.queryByText('Emily Tester')).not.toBeInTheDocument()
      expect(screen.queryByText('Task one')).not.toBeInTheDocument()
      expect(screen.getByRole('status', { name: he.profileCard.loading })).toBeInTheDocument()
      expect(screen.getByRole('status', { name: he.customerTasks.loading })).toBeInTheDocument()
    })
  })
})
