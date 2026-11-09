import { useState } from 'react'

export function useAvatarImage(src: string | null) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const shouldShowImage = src !== null && src !== failedSrc
  const handleError = () => setFailedSrc(src)

  return { shouldShowImage, handleError }
}
