import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.hoisted(() => {
  vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.test')
})

import { useCustomerTasks } from '..'

const BODY = {
  todos: [{ id: 1, todo: 'Call back', completed: true, userId: 5 }],
  total: 1,
  skip: 0,
  limit: 30,
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status })
}

describe('useCustomerTasks', () => {
  it('maps 404 to not-found, 500 and network failure to error, retry gives success', async () => {
    const fetchMock = vi
      .fn<(url: string, init?: RequestInit) => Promise<Response>>()
      .mockResolvedValueOnce(jsonResponse({}, 404))
      .mockResolvedValueOnce(jsonResponse({}, 500))
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValueOnce(jsonResponse(BODY))
    vi.stubGlobal('fetch', fetchMock)

    const { result } = renderHook(() => useCustomerTasks(3))
    await waitFor(() => {
      expect(result.current.state.status).toBe('not-found')
    })

    for (const expected of ['error', 'error', 'success']) {
      act(() => {
        result.current.retry()
      })
      await waitFor(() => {
        expect(result.current.state.status).toBe(expected)
      })
    }

    expect(fetchMock).toHaveBeenCalledTimes(4)
    const urls = fetchMock.mock.calls.map((call) => call[0])
    expect(new Set(urls)).toEqual(new Set(['https://api.example.test/users/3/todos']))
    expect(result.current.state).toEqual({
      status: 'success',
      data: [{ id: 1, text: 'Call back', isCompleted: true }],
    })
  })

  it('reports error when todos is not an array', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ todos: 'x' })))

    const { result } = renderHook(() => useCustomerTasks(1))

    await waitFor(() => {
      expect(result.current.state.status).toBe('error')
    })
  })

  it.each([0, -1, 1.5, NaN])('does not call fetch for invalid id %s', async (id) => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const { result } = renderHook(() => useCustomerTasks(id))

    await waitFor(() => {
      expect(result.current.state.status).toBe('error')
    })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('shows loading right after id change and ignores the late response of the old id', async () => {
    const pending = new Map<string, (response: Response) => void>()
    const signals = new Map<string, AbortSignal>()
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string, init?: RequestInit) => {
        if (init?.signal) signals.set(url, init.signal)
        return new Promise<Response>((resolve) => {
          pending.set(url, resolve)
        })
      }),
    )
    const url = (id: number) => `https://api.example.test/users/${id}/todos`
    const bodyFor = (text: string) => ({ todos: [{ id: 1, todo: text, completed: false }] })

    const { result, rerender } = renderHook(({ id }) => useCustomerTasks(id), {
      initialProps: { id: 1 },
    })
    await waitFor(() => {
      expect(pending.has(url(1))).toBe(true)
    })

    rerender({ id: 2 })
    expect(result.current.state).toEqual({ status: 'loading' })
    expect(signals.get(url(1))?.aborted).toBe(true)
    await waitFor(() => {
      expect(pending.has(url(2))).toBe(true)
    })

    await act(async () => {
      pending.get(url(2))?.(jsonResponse(bodyFor('Two')))
      await Promise.resolve()
    })
    await waitFor(() => {
      expect(result.current.state.status).toBe('success')
    })
    await act(async () => {
      pending.get(url(1))?.(jsonResponse(bodyFor('One')))
      await Promise.resolve()
    })

    expect(result.current.state).toEqual({
      status: 'success',
      data: [{ id: 1, text: 'Two', isCompleted: false }],
    })
  })
})
