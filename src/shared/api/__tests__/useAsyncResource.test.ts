import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { HttpError, NetworkError, useAsyncResource } from '..'

describe('useAsyncResource', () => {
  it('starts in loading and then reports success', async () => {
    const { result } = renderHook(() => useAsyncResource(1, () => Promise.resolve('data')))

    expect(result.current.state).toEqual({ status: 'loading' })
    await waitFor(() => {
      expect(result.current.state).toEqual({ status: 'success', data: 'data' })
    })
  })

  it('maps HttpError 404 to not-found and other failures to error', async () => {
    const notFound = renderHook(() =>
      useAsyncResource(1, () => Promise.reject(new HttpError(404))),
    )
    const serverError = renderHook(() =>
      useAsyncResource(1, () => Promise.reject(new HttpError(500))),
    )
    const network = renderHook(() =>
      useAsyncResource(1, () => Promise.reject(new NetworkError())),
    )
    const mapper = renderHook(() =>
      useAsyncResource(1, () => Promise.reject(new TypeError('bad shape'))),
    )

    await waitFor(() => {
      expect(notFound.result.current.state.status).toBe('not-found')
    })
    await waitFor(() => {
      expect(serverError.result.current.state.status).toBe('error')
      expect(network.result.current.state.status).toBe('error')
      expect(mapper.result.current.state.status).toBe('error')
    })
  })

  it('turns a synchronous throw of the loader into error', async () => {
    const { result } = renderHook(() =>
      useAsyncResource(1, () => {
        throw new RangeError('bad id')
      }),
    )

    await waitFor(() => {
      expect(result.current.state.status).toBe('error')
    })
  })

  it('retry() reruns the loader and ends in success', async () => {
    const load = vi
      .fn<(signal: AbortSignal) => Promise<string>>()
      .mockRejectedValueOnce(new HttpError(500))
      .mockResolvedValueOnce('ok')
    const { result } = renderHook(() => useAsyncResource(1, load))

    await waitFor(() => {
      expect(result.current.state.status).toBe('error')
    })
    act(() => {
      result.current.retry()
    })

    expect(result.current.state.status).toBe('loading')
    await waitFor(() => {
      expect(result.current.state).toEqual({ status: 'success', data: 'ok' })
    })
    expect(load).toHaveBeenCalledTimes(2)
  })

  it('shows loading in the same render when key changes and ignores a late response', async () => {
    const resolvers = new Map<number, (value: string) => void>()
    const signals = new Map<number, AbortSignal>()
    const { result, rerender } = renderHook(
      ({ id }) =>
        useAsyncResource(id, (signal) => {
          signals.set(id, signal)
          return new Promise<string>((resolve) => {
            resolvers.set(id, resolve)
          })
        }),
      { initialProps: { id: 1 } },
    )
    await waitFor(() => {
      expect(resolvers.has(1)).toBe(true)
    })

    rerender({ id: 2 })
    expect(result.current.state.status).toBe('loading')
    expect(signals.get(1)?.aborted).toBe(true)
    await waitFor(() => {
      expect(resolvers.has(2)).toBe(true)
    })

    await act(async () => {
      resolvers.get(2)?.('two')
      await Promise.resolve()
    })
    await waitFor(() => {
      expect(result.current.state).toEqual({ status: 'success', data: 'two' })
    })
    await act(async () => {
      resolvers.get(1)?.('one')
      await Promise.resolve()
    })

    expect(result.current.state).toEqual({ status: 'success', data: 'two' })
  })

  it('does not show previous key data while the new key loads', async () => {
    const { result, rerender } = renderHook(
      ({ id }) =>
        useAsyncResource(id, (signal) =>
          id === 1
            ? Promise.resolve('one')
            : new Promise<string>((_resolve, reject) => {
                signal.addEventListener('abort', () => {
                  reject(new DOMException('Aborted', 'AbortError'))
                })
              }),
        ),
      { initialProps: { id: 1 } },
    )
    await waitFor(() => {
      expect(result.current.state.status).toBe('success')
    })

    rerender({ id: 2 })

    expect(result.current.state).toEqual({ status: 'loading' })
  })

  it('aborts the request on unmount without logging errors', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    let captured: AbortSignal | undefined
    const { unmount } = renderHook(() =>
      useAsyncResource(1, (signal) => {
        captured = signal
        return new Promise<string>((_resolve, reject) => {
          signal.addEventListener('abort', () => {
            reject(new DOMException('Aborted', 'AbortError'))
          })
        })
      }),
    )
    await waitFor(() => {
      expect(captured).toBeDefined()
    })

    unmount()
    await Promise.resolve()

    expect(captured?.aborted).toBe(true)
    expect(consoleError).not.toHaveBeenCalled()
    expect(consoleWarn).not.toHaveBeenCalled()
  })
})
