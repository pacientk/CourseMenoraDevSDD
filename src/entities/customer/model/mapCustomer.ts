import type { Customer } from './types'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function requireString(value: unknown): string {
  if (typeof value !== 'string' || value === '') {
    throw new TypeError('Unexpected customer shape')
  }
  return value
}

function toAvatarUrl(value: unknown): string | null {
  return typeof value === 'string' && value.startsWith('https://') ? value : null
}

// Белый список: модель собирается по одному полю, сырой ответ дальше не уходит.
export function mapCustomer(raw: unknown): Customer {
  if (!isRecord(raw)) throw new TypeError('Unexpected customer shape')
  const { id, address } = raw
  if (typeof id !== 'number' || !Number.isSafeInteger(id) || id <= 0) {
    throw new TypeError('Unexpected customer shape')
  }
  if (!isRecord(address)) throw new TypeError('Unexpected customer shape')

  return {
    id,
    firstName: requireString(raw.firstName),
    lastName: requireString(raw.lastName),
    phone: requireString(raw.phone),
    email: requireString(raw.email),
    city: requireString(address.city),
    avatarUrl: toAvatarUrl(raw.image),
  }
}
