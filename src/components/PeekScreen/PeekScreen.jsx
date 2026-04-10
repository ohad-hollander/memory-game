// src/components/PeekScreen/PeekScreen.jsx
import { useEffect, useState } from 'react'
import { DIFFICULTY_CONFIG } from '../../constants'
import CardGrid from '../GameBoard/CardGrid'
import styles from './PeekScreen.module.css'

export default function PeekScreen({ state, dispatch }) {
  const { difficulty, cards } = state
  const { peekSeconds } = DIFFICULTY_CONFIG[difficulty]
  const [count, setCount] = useState(peekSeconds)

  useEffect(() => {
    if (count <= 0) { dispatch({ type: 'PEEK_DONE' }); return }
    const timer = setTimeout(() => setCount(c => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [count])

  return (
    <div className={styles.screen}>
      <div className={styles.header}>
        <div className={styles.label}>👀 Memorise the cards!</div>
        <div className={styles.sub}>Game starts in…</div>
      </div>
      <div className={styles.countdown}>{count}</div>
      <CardGrid cards={cards} difficulty={difficulty} onCardClick={() => {}} />
    </div>
  )
}
