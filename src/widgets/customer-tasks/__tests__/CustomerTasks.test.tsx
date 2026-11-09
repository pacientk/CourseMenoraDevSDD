import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.hoisted(() => {
  vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.test')
})

import { he } from '@/shared/i18n/he'
import { CustomerTasks } from '..'

const URL_TASKS = 'https://api.example.test/users/7/todos'

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status })
}

function todosBody(todos: unknown) {
  return { todos, total: 2, skip: 0, limit: 30 }
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

describe('CustomerTasks', () => {
  it('shows text and the matching status for each task', async () => {
    stubFetch().mockResolvedValue(
      jsonResponse(
        todosBody([
          { id: 1, todo: 'Call back', completed: true, userId: 7 },
          { id: 2, todo: 'Send form', completed: false, userId: 7 },
        ]),
      ),
    )
    render(<CustomerTasks customerId={7} />)

    const rows = await screen.findAllByRole('listitem')
    expect(rows).toHaveLength(2)
    const [doneRow, openRow] = rows.map((row) => within(row))
    if (!doneRow || !openRow) throw new Error('expected two rows')
    expect(doneRow.getByText('Call back')).toBeInTheDocument()
    expect(doneRow.getByText(he.customerTasks.status.done)).toBeInTheDocument()
    expect(doneRow.queryByText(he.customerTasks.status.open)).not.toBeInTheDocument()
    expect(openRow.getByText('Send form')).toBeInTheDocument()
    expect(openRow.getByText(he.customerTasks.status.open)).toBeInTheDocument()
    expect(openRow.queryByText(he.customerTasks.status.done)).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: he.customerTasks.title })).toBeInTheDocument()
  })

  it('shows the empty text only when there are no tasks', async () => {
    const fetchMock = stubFetch().mockResolvedValue(jsonResponse(todosBody([])))
    const first = render(<CustomerTasks customerId={7} />)
    expect(await screen.findByText(he.customerTasks.empty)).toBeInTheDocument()
    first.unmount()

    fetchMock.mockResolvedValue(jsonResponse(todosBody([{ id: 1, todo: 'A', completed: false }])))
    render(<CustomerTasks customerId={7} />)
    expect(await screen.findByText('A')).toBeInTheDocument()
    expect(screen.queryByText(he.customerTasks.empty)).not.toBeInTheDocument()
  })

  it('shows a busy status while loading and removes it after the response', async () => {
    let resolve: (response: Response) => void = () => {}
    stubFetch().mockReturnValue(
      new Promise<Response>((r) => {
        resolve = r
      }),
    )
    render(<CustomerTasks customerId={7} />)

    const status = screen.getByRole('status', { name: he.customerTasks.loading })
    expect(status).toHaveAttribute('aria-busy', 'true')
    expect(screen.queryByRole('list')).not.toBeInTheDocument()

    resolve(jsonResponse(todosBody([])))
    await screen.findByText(he.customerTasks.empty)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('shows not-found without a retry button on 404', async () => {
    stubFetch().mockResolvedValue(jsonResponse({}, 404))
    render(<CustomerTasks customerId={7} />)

    expect(await screen.findByText(he.states.notFound)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: he.states.retry })).not.toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('shows an alert on 500 and retry refetches the same url and shows the list', async () => {
    const fetchMock = stubFetch()
      .mockResolvedValueOnce(jsonResponse({}, 500))
      .mockResolvedValueOnce(jsonResponse(todosBody([{ id: 1, todo: 'Call back', completed: true }])))
    const user = userEvent.setup()
    render(<CustomerTasks customerId={7} />)

    expect(await screen.findByRole('alert')).toHaveTextContent(he.states.error)
    await user.click(screen.getByRole('button', { name: he.states.retry }))

    expect(await screen.findByText('Call back')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: he.states.retry })).not.toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(fetchMock.mock.calls.map((call) => call[0])).toEqual([URL_TASKS, URL_TASKS])
  })

  it('shows an alert with retry on a network failure', async () => {
    stubFetch().mockRejectedValue(new TypeError('Failed to fetch'))
    render(<CustomerTasks customerId={7} />)

    expect(await screen.findByRole('alert')).toHaveTextContent(he.states.error)
    expect(screen.getByRole('button', { name: he.states.retry })).toBeInTheDocument()
  })

  it.each([
    ['todos is not an array', { todos: 'nope' }],
    ['body is an array', []],
    ['item has no todo', todosBody([{ id: 1, completed: true }])],
    ['completed is not boolean', todosBody([{ id: 1, todo: 'A', completed: 'yes' }])],
  ])('shows an alert with retry when %s', async (_name, body) => {
    stubFetch().mockResolvedValue(jsonResponse(body))
    render(<CustomerTasks customerId={7} />)

    expect(await screen.findByRole('alert')).toHaveTextContent(he.states.error)
    expect(screen.getByRole('button', { name: he.states.retry })).toBeInTheDocument()
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })

  it('does not render userId or other fields beyond the whitelist', async () => {
    stubFetch().mockResolvedValue(
      jsonResponse(
        todosBody([{ id: 1, todo: 'Call back', completed: true, userId: 987654, password: 'hunter2' }]),
      ),
    )
    const { container } = render(<CustomerTasks customerId={7} />)

    await waitFor(() => {
      expect(screen.getByText('Call back')).toBeInTheDocument()
    })
    expect(container.textContent).not.toContain('987654')
    expect(container.textContent).not.toContain('hunter2')
  })
})
