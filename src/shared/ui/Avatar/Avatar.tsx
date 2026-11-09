import type { IAvatarProps } from './IAvatar'
import styles from './Avatar.module.css'
import { useAvatarImage } from './useAvatarImage'

export function Avatar({ src, initials }: IAvatarProps) {
  const { shouldShowImage, handleError } = useAvatarImage(src)

  return (
    <span className={styles.avatar}>
      {shouldShowImage ? (
        <img className={styles.image} src={src ?? undefined} alt="" onError={handleError} />
      ) : (
        initials
      )}
    </span>
  )
}
