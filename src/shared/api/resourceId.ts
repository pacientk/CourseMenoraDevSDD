const RESOURCE_ID_PATTERN = /^[1-9][0-9]*$/

export function isResourceId(value: number): boolean {
  return Number.isSafeInteger(value) && value > 0
}

export function parseResourceId(raw: string | undefined): number | null {
  if (raw === undefined || !RESOURCE_ID_PATTERN.test(raw)) return null
  const value = Number(raw)
  return isResourceId(value) ? value : null
}
