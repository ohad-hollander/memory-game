// src/components/GameBoard/GameBoard.jsx
import { useEffect, useRef } from 'react'
import { DIFFICULTY_CONFIG } from '../../constants'
import HUD from './HUD'
import ProgressBar from './ProgressBar'
import CardGrid from './CardGrid'
import PauseMenu from './PauseMenu'
import styles from './GameBoard.module.css'

export default function GameBoard({ state, dispatch, play, isFullscreen, toggleFullscreen }) {
  const { cards, difficulty, flippedIds, isEvaluating, isPaused, pairsFound, totalPairs, players, activePlayer, elapsedSeconds } = state
  const { countdown } = DIFFICULTY_CONFIG[difficulty]

  // Hard mode: time's up → navigate home
  useEffect(() => {
    if (countdown !== null && elapsedSeconds >= countdown) {
      dispatch({ type: 'NAVIGATE', screen: 'home' })
    }
  }, [elapsedSeconds, countdown])

  // Resolve non-matching pair after 1 second
  useEffect(() => {
    if (!isEvaluating || flippedIds.length !== 2) return
    const [id1, id2] = flippedIds
    const c1 = cards.find(c => c.id === id1)
    const c2 = cards.find(c => c.id === id2)
    if (c1 && c2 && c1.photoId !== c2.photoId) {
      play('noMatch')
      const timer = setTimeout(() => dispatch({ type: 'RESOLVE_FLIP' }), 1000)
      return () => clearTimeout(timer)
    }
  }, [isEvaluating, flippedIds])

  function handleCardClick(id) {
    play('flip')
    dispatch({ type: 'FLIP_CARD', id })
  }

  // Play match sound when pairsFound increases
  const prevPairs = useRef(0)
  useEffect(() => {
    if (pairsFound > prevPairs.current) play('match')
    prevPairs.current = pairsFound
  }, [pairsFound])

  const is2P = players.length > 1

  return (
    <div className={styles.board}>
      {is2P && (
        <div className={styles.playerTabs}>
          {players.map((p, i) => (
            <div key={i} className={`${styles.playerTab} ${i === activePlayer ? styles.active : ''}`}>
              {p.name} — {p.score}
            </div>
          ))}
        </div>
      )}
      <HUD state={state} dispatch={dispatch} play={play} isFullscreen={isFullscreen} toggleFullscreen={toggleFullscreen} />
      <ProgressBar pairsFound={pairsFound} totalPairs={totalPairs} />
      <CardGrid cards={cards} difficulty={difficulty} onCardClick={handleCardClick} />
      {isPaused && <PauseMenu dispatch={dispatch} />}
    </div>
  )
}
