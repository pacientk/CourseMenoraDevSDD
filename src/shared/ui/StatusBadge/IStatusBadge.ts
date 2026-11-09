import type { ReactNode } from 'react'

export interface IStatusBadgeProps {
  tone: 'success' | 'warning'
  children: ReactNode
}
