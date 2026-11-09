import { useParams } from 'react-router'
import { parseResourceId } from '@/shared/api'

/** Parses the `:customerId` route segment; `null` when it is not a valid id. */
export function useCustomerId(): number | null {
  const { customerId } = useParams()
  return parseResourceId(customerId)
}
