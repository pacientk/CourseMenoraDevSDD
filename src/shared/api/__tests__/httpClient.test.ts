import { describe, expect, it, vi } from 'vitest'

vi.hoisted(() => {
  vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.test')
})

import { HttpError, NetworkError, ParseError, getJson, isAbortError } from '..'

function stubFetch(impl: (url: string, init?: RequestInit) => Promise<Response>) {
  const fetchMock = vi.fn(impl)
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

describe('getJson', () => {
  it('returns parsed JSON and requests base URL + path', async () => {
    const fetchMock = stubFetch(() => Promise.resolve(Response.json({ ok: 1 })))

    await expect(getJson('/users/1')).resolves.toEqual({ ok: 1 })
    expect(fetchMock.mock.calls[0]?.[0]).toBe('https://api.example.test/users/1')
  })

  it.each([404, 500])('throws HttpError with status %i on non-2xx', async (status) => {
    stubFetch(() => Promise.resolve(new Response('{}', { status })))

    const error: unknown = await getJson('/x').catch((e: unknown) => e)

    expect(error).toBeInstanceOf(HttpError)
    expect(error).toMatchObject({ status })
  })

  it('throws NetworkError when fetch rejects', async () => {
    stubFetch(() => Promise.reject(new TypeError('Failed to fetch')))

    await expect(getJson('/x')).rejects.toBeInstanceOf(NetworkError)
  })

  it('throws ParseError on invalid JSON', async () => {
    stubFetch(() => Promise.resolve(new Response('not json', { status: 200 })))

    await expect(getJson('/x')).rejects.toBeInstanceOf(ParseError)
  })

  it('rejects with AbortError, not NetworkError, when aborted', async () => {
    stubFetch((_url, init) => {
      return new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => {
          reject(new DOMException('Aborted', 'AbortError'))
        })
      })
    })
    const controller = new AbortController()

    const pending = getJson('/x', { signal: controller.signal }).catch((e: unknown) => e)
    controller.abort()
    const error = await pending

    expect(isAbortError(error)).toBe(true)
    expect(error).not.toBeInstanceOf(NetworkError)
  })

  it('does not treat ordinary errors as abort', () => {
    expect(isAbortError(new Error('boom'))).toBe(false)
    expect(isAbortError(null)).toBe(false)
  })
})
