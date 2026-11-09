export type LoadState<T> =
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'not-found' }
  | { status: 'error' }

export interface ILoadResult<T> {
  state: LoadState<T>
  retry: () => void
}
