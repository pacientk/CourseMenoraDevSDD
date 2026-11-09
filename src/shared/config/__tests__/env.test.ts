import { afterEach, describe, expect, it, vi } from 'vitest'

async function loadEnv() {
  vi.resetModules()
  return import('../env')
}

describe('env', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('exposes the API base URL without a trailing slash', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.test/')

    const { env } = await loadEnv()

    expect(env.apiBaseUrl).toBe('https://api.example.test')
  })

  it('accepts a local path for the offline mock', async () => {
    vi.stubEnv('VITE_API_BASE_URL', '/mock-api')

    const { env } = await loadEnv()

    expect(env.apiBaseUrl).toBe('/mock-api')
  })

  it('rejects an empty value', async () => {
    vi.stubEnv('VITE_API_BASE_URL', '')

    await expect(loadEnv()).rejects.toThrow(/VITE_API_BASE_URL is not set/)
  })

  it('rejects a plain http URL', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'http://api.example.test')

    await expect(loadEnv()).rejects.toThrow(/must be an https/)
  })
})
