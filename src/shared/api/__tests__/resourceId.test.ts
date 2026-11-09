import { describe, expect, it } from 'vitest'
import { isResourceId, parseResourceId } from '..'

describe('parseResourceId', () => {
  it.each([
    ['1', 1],
    ['42', 42],
  ])('accepts %j', (raw, expected) => {
    expect(parseResourceId(raw)).toBe(expected)
  })

  it.each(['abc', '0', '-1', '1.5', '007', '1e3', '', '9007199254740993', ' 1'])(
    'rejects %j',
    (raw) => {
      expect(parseResourceId(raw)).toBeNull()
    },
  )

  it('rejects undefined', () => {
    expect(parseResourceId(undefined)).toBeNull()
  })
})

describe('isResourceId', () => {
  it('accepts positive safe integers', () => {
    expect(isResourceId(1)).toBe(true)
    expect(isResourceId(42)).toBe(true)
  })

  it.each([0, -1, 1.5, NaN, Infinity, 2 ** 53])('rejects %s', (value) => {
    expect(isResourceId(value)).toBe(false)
  })
})
