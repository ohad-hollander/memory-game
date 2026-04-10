// src/components/GameBoard/HUD.jsx
import { useEffect, useRef } from 'react'
import { DIFFICULTY_CONFIG } from '../../constants'
import styles from './HUD.module.css'

function formatTime(seconds, countdown) {
  const t = countdown !== null ? Math.max(0, countdown - seconds) : seconds
  const m = Math.floor(t / 60).toString().padStart(2, '0')
  const s = (t % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

function findHintPair(cards) {
  const unmatched = cards.filter(c => !c.isMatched)
  const groups = {}
  unmatched.forEach(c => { groups[c.photoId] = groups[c.photoId] || []; groups[c.photoId].push(c.id) })
  const pairs = Object.values(groups).filter(g => g.length === 2)
  if (pairs.length === 0) return null
  return pairs[Math.floor(Math.random() * pairs.length)]
}

export default function HUD({ state, dispatch, play, isFullscreen, toggleFullscreen }) {
  const { difficulty, moves, elapsedSeconds, pairsFound, totalPairs, isEvaluating, isMuted, players, activePlayer } = state
  const { countdown } = DIFFICULTY_CONFIG[difficulty]

  const hintTimer = useRef(null)

  function handleHint() {
    const pair = findHintPair(state.cards)
    if (!pair) return
    play('match')
    dispatch({ type: 'USE_HINT', ids: pair })
    if (hintTimer.current) clearTimeout(hintTimer.current)
    hintTimer.current = setTimeout(() => dispatch({ type: 'HINT_DONE', ids: pair }), 1500)
  }

  useEffect(() => () => { if (hintTimer.current) clearTimeout(hintTimer.current) }, [])

  const is2P = players.length > 1

  return (
    <div className={styles.hud}>
      <div className={styles.stat}>
        <div className={styles.val}>{formatTime(elapsedSeconds, countdown)}</div>
        <div className={styles.lbl}>Time</div>
      </div>
      <div className={styles.stat}>
        <div className={styles.val}>{moves}</div>
        <div className={styles.lbl}>Moves</div>
      </div>
      <div className={styles.stat}>
        <div className={styles.val}>{pairsFound}/{totalPairs}</div>
        <div className={styles.lbl}>Pairs</div>
      </div>
      {is2P && (
        <div className={styles.stat}>
          <div className={styles.val}>{players[activePlayer].name}</div>
          <div className={styles.lbl}>Turn</div>
        </div>
      )}
      <div className={styles.actions}>
        <button className={styles.hintBtn} onClick={handleHint} disabled={isEvaluating}>
          💡 Hint
        </button>
        <button className={styles.iconBtn} onClick={() => dispatch({ type: 'TOGGLE_MUTE' })} title={isMuted ? 'Unmute' : 'Mute'}>
          {isMuted ? '🔇' : '🔊'}
        </button>
        <button className={styles.iconBtn} onClick={toggleFullscreen} title="Fullscreen">
          ⛶
        </button>
        <button className={styles.iconBtn} onClick={() => dispatch({ type: 'PAUSE' })} title="Pause">
          ⏸
        </button>
      </div>
    </div>
  )
}
