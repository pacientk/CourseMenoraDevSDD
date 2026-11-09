// Типизированные ошибки HTTP-клиента. Сообщения техничны и не содержат тела ответа.
export class HttpError extends Error {
  readonly status: number

  constructor(status: number) {
    super(`HTTP ${status}`)
    this.name = 'HttpError'
    this.status = status
  }
}

export class NetworkError extends Error {
  constructor() {
    super('Network failure')
    this.name = 'NetworkError'
  }
}

export class ParseError extends Error {
  constructor() {
    super('Invalid JSON in response')
    this.name = 'ParseError'
  }
}

export function isAbortError(error: unknown): boolean {
  return (
    typeof error === 'object' && error !== null && 'name' in error && error.name === 'AbortError'
  )
}
