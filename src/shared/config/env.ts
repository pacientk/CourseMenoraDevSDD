// The only place that reads environment variables. Checked at start-up:
// the app must not silently run with an empty or malformed API address.
function readApiBaseUrl(): string {
  const value: unknown = import.meta.env.VITE_API_BASE_URL
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error('VITE_API_BASE_URL is not set. Copy .env.example to .env.')
  }
  const isHttps = value.startsWith('https://')
  const isLocalMock = value.startsWith('/')
  if (!isHttps && !isLocalMock) {
    throw new Error('VITE_API_BASE_URL must be an https:// URL or a local path.')
  }
  return value.replace(/\/+$/, '')
}

export const env = {
  apiBaseUrl: readApiBaseUrl(),
} as const
