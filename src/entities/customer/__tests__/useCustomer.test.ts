import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.hoisted(() => {
  vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.test')
})

import { useCustomer } from '..'

const PROFILE = {
  id: 1,
  firstName: 'Emily',
  lastName: 'Johnson',
  phone: '+81 965',
  email: 'emily@example.test',
  address: { city: 'Phoenix' },
  password: 'S3cr3t',
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status })
}

describe('useCustomer', () => {
  it('maps 404 to not-found, 500 and network failure to error, retry gives success', async () => {
    const fetchMock = vi
      .fn<(url: string, init?: RequestInit) => Promise<Response>>()
      .mockResolvedValueOnce(jsonResponse({}, 404))
      .mockResolvedValueOnce(jsonResponse({}, 500))
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValueOnce(jsonResponse(PROFILE))
    vi.stubGlobal('fetch', fetchMock)

    const { result } = renderHook(() => useCustomer(1))
    await waitFor(() => {
      expect(result.current.state.status).toBe('not-found')
    })

    act(() => {
      result.current.retry()
    })
    await waitFor(() => {
      expect(result.current.state.status).toBe('error')
    })

    act(() => {
      result.current.retry()
    })
    await waitFor(() => {
      expect(result.current.state.status).toBe('error')
    })
    expect(fetchMock).toHaveBeenCalledTimes(3)

    act(() => {
      result.current.retry()
    })
    await waitFor(() => {
      expect(result.current.state.status).toBe('success')
    })
    expect(fetchMock).toHaveBeenCalledTimes(4)
    const urls = fetchMock.mock.calls.map((call) => call[0])
    expect(new Set(urls)).toEqual(new Set(['https://api.example.test/users/1']))
    expect(JSON.stringify(result.current.state)).not.toContain('S3cr3t')
  })

  it('reports error for an unexpected body shape', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse([PROFILE])))

    const { result } = renderHook(() => useCustomer(1))

    await waitFor(() => {
      expect(result.current.state.status).toBe('error')
    })
  })

  it.each([0, -1, 1.5, NaN])('does not call fetch for invalid id %s', async (id) => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const { result } = renderHook(() => useCustomer(id))

    await waitFor(() => {
      expect(result.current.state.status).toBe('error')
    })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('shows the new customer only: loading on switch, late response of the old one ignored', async () => {
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
    const url = (id: number) => `https://api.example.test/users/${id}`

    const { result, rerender } = renderHook(({ id }) => useCustomer(id), {
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
      pending.get(url(2))?.(jsonResponse({ ...PROFILE, id: 2, firstName: 'Two' }))
      await Promise.resolve()
    })
    await waitFor(() => {
      expect(result.current.state.status).toBe('success')
    })
    await act(async () => {
      pending.get(url(1))?.(jsonResponse({ ...PROFILE, id: 1, firstName: 'One' }))
      await Promise.resolve()
    })

    expect(result.current.state).toMatchObject({ status: 'success', data: { id: 2 } })
  })
})
