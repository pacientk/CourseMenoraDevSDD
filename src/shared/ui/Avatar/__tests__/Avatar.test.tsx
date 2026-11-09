import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Avatar } from '../Avatar'

const SRC = 'https://example.com/a.png'

describe('Avatar', () => {
  it('renders an image with empty alt when src is given, then falls back to initials on error', () => {
    const { container } = render(<Avatar src={SRC} initials="AB" />)
    const img = container.querySelector('img')
    expect(img).not.toBeNull()
    expect(img).toHaveAttribute('alt', '')
    expect(screen.queryByText('AB')).not.toBeInTheDocument()
    if (img) fireEvent.error(img)
    expect(container.querySelector('img')).toBeNull()
    expect(screen.getByText('AB')).toBeInTheDocument()
  })

  it('renders only initials when src is null', () => {
    const { container } = render(<Avatar src={null} initials="AB" />)
    expect(container.querySelector('img')).toBeNull()
    expect(screen.getByText('AB')).toBeInTheDocument()
  })

  it('shows the image again when src changes after a failure', () => {
    const { container, rerender } = render(<Avatar src={SRC} initials="AB" />)
    const img = container.querySelector('img')
    if (img) fireEvent.error(img)
    expect(container.querySelector('img')).toBeNull()
    rerender(<Avatar src="https://example.com/b.png" initials="AB" />)
    expect(container.querySelector('img')).not.toBeNull()
  })
})
