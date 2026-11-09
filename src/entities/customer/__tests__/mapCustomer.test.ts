import { describe, expect, it, vi } from 'vitest'
import { mapCustomer } from '../model/mapCustomer'

const SENSITIVE = {
  password: 'S3cr3t-pass-value',
  ssn: '123-45-6789-ssn',
  bank: { cardNumber: '4111-1111-1111-1111', iban: 'DE89370400440532013000' },
  ip: '203.0.113.77',
  macAddress: 'aa:bb:cc:dd:ee:ff',
  crypto: { wallet: '0xWALLET-ADDRESS' },
}

function validBody(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: 1,
    firstName: 'Emily',
    lastName: 'Johnson',
    phone: '+81 965-431-3024',
    email: 'emily@example.test',
    image: 'https://cdn.example.test/emily.png',
    address: { city: 'Phoenix', address: '626 Main Street' },
    ...SENSITIVE,
    ...overrides,
  }
}

describe('mapCustomer', () => {
  it('returns exactly the whitelisted keys and leaks no sensitive values', () => {
    const consoleSpies = (['log', 'info', 'warn', 'error', 'debug'] as const).map((method) =>
      vi.spyOn(console, method),
    )

    const customer = mapCustomer(validBody())

    expect(Object.keys(customer).sort()).toEqual(
      ['avatarUrl', 'city', 'email', 'firstName', 'id', 'lastName', 'phone'].sort(),
    )
    expect(customer).toEqual({
      id: 1,
      firstName: 'Emily',
      lastName: 'Johnson',
      phone: '+81 965-431-3024',
      email: 'emily@example.test',
      city: 'Phoenix',
      avatarUrl: 'https://cdn.example.test/emily.png',
    })
    const serialized = JSON.stringify(customer)
    for (const secret of ['S3cr3t-pass-value', '123-45-6789-ssn', '4111', 'DE89', '203.0.113.77']) {
      expect(serialized).not.toContain(secret)
    }
    for (const spy of consoleSpies) expect(spy).not.toHaveBeenCalled()
  })

  it.each<[string, unknown]>([
    ['firstName is missing', validBody({ firstName: undefined })],
    ['firstName is empty', validBody({ firstName: '' })],
    ['address is missing', validBody({ address: undefined })],
    ['address is not an object', validBody({ address: 'Phoenix' })],
    ['city is missing', validBody({ address: {} })],
    ['phone is a number', validBody({ phone: 5551234 })],
    ['email is missing', validBody({ email: undefined })],
    ['id is zero', validBody({ id: 0 })],
    ['id is a string', validBody({ id: '1' })],
    ['root is an array', [validBody()]],
    ['root is null', null],
    ['root is a string', 'oops'],
  ])('throws when %s', (_name, body) => {
    expect(() => mapCustomer(body)).toThrow()
  })

  it.each([
    ['https://cdn.example.test/a.png', 'https://cdn.example.test/a.png'],
    ['http://cdn.example.test/a.png', null],
    ['javascript:alert(1)', null],
    ['data:image/png;base64,AAAA', null],
    ['', null],
    [undefined, null],
    [42, null],
  ])('maps image %j to %j', (image, expected) => {
    expect(mapCustomer(validBody({ image })).avatarUrl).toBe(expected)
  })
})
