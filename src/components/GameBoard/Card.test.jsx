// src/components/GameBoard/Card.test.jsx
import { render, screen, fireEvent } from '@testing-library/react'
import Card from './Card'

const baseCard = {
  id: '1-a', photoId: 1, src: '/photos/photo1.jpg',
  label: 'Beach', isFlipped: false, isMatched: false, borderColor: '#fda4af',
}

describe('Card', () => {
  it('renders a face-down card (back visible, front hidden)', () => {
    render(<Card card={baseCard} onClick={() => {}} />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const onClick = vi.fn()
    render(<Card card={baseCard} onClick={onClick} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledWith('1-a')
  })

  it('does not call onClick when card is matched', () => {
    const onClick = vi.fn()
    render(<Card card={{ ...baseCard, isMatched: true }} onClick={onClick} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('does not call onClick when card is flipped', () => {
    const onClick = vi.fn()
    render(<Card card={{ ...baseCard, isFlipped: true }} onClick={onClick} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).not.toHaveBeenCalled()
  })
})
