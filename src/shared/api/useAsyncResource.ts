import { useEffect, useRef, useState } from 'react'
import { HttpError, isAbortError } from './errors'
import type { ILoadResult, LoadState } from './types'

interface IStoredResult<T> {
  key: number
  reloadToken: number
  state: LoadState<T>
}

function toFailureState(error: unknown): LoadState<never> {
  return error instanceof HttpError && error.status === 404
    ? { status: 'not-found' }
    : { status: 'error' }
}

export function useAsyncResource<T>(
  key: number,
  load: (signal: AbortSignal) => Promise<T>,
): ILoadResult<T> {
  const [stored, setStored] = useState<IStoredResult<T> | null>(null)
  const [reloadToken, setReloadToken] = useState(0)
  const [seenKey, setSeenKey] = useState(key)
  const loadRef = useRef(load)

  useEffect(() => {
    loadRef.current = load
  })

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller

    // Конструктор Promise превращает и синхронный throw загрузчика в отклонение.
    new Promise<T>((resolve) => {
      resolve(loadRef.current(signal))
    }).then(
      (data) => {
        if (signal.aborted) return
        setStored({ key, reloadToken, state: { status: 'success', data } })
      },
      (error: unknown) => {
        if (signal.aborted || isAbortError(error)) return
        setStored({ key, reloadToken, state: toFailureState(error) })
      },
    )

    return () => {
      controller.abort()
    }
  }, [key, reloadToken])

  // Смена ключа сбрасывает сохранённый результат в том же рендере: иначе при возврате
  // A → B → A старый результат A показался бы, пока новый запрос ещё в полёте.
  if (!Object.is(seenKey, key)) {
    setSeenKey(key)
    setStored(null)
  }

  // Результат другого ключа или прежней попытки не показываем ни на один кадр.
  // Object.is: NaN === NaN ложно, а невалидный id (NaN) обязан дойти до состояния error.
  const isCurrent =
    stored !== null && Object.is(stored.key, key) && stored.reloadToken === reloadToken
  const state: LoadState<T> = isCurrent ? stored.state : { status: 'loading' }

  return {
    state,
    retry: () => {
      setReloadToken((token) => token + 1)
    },
  }
}
