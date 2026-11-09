import { env } from '@/shared/config/env'
import { HttpError, isAbortError, NetworkError, ParseError } from './errors'

interface IGetJsonOptions {
  signal?: AbortSignal
}

export async function getJson(path: string, options: IGetJsonOptions = {}): Promise<unknown> {
  let response: Response
  try {
    response = await fetch(`${env.apiBaseUrl}${path}`, { signal: options.signal })
  } catch (error) {
    if (isAbortError(error)) throw error
    throw new NetworkError()
  }

  if (!response.ok) throw new HttpError(response.status)

  try {
    const body: unknown = await response.json()
    return body
  } catch (error) {
    if (isAbortError(error)) throw error
    throw new ParseError()
  }
}
