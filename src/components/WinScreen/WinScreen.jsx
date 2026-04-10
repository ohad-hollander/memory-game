// src/components/WinScreen/WinScreen.jsx
import { useEffect } from 'react'
import confetti from 'canvas-confetti'
import { getStarRating } from '../../utils/starRating'
import styles from './WinScreen.module.css'

function formatTime(s) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

export default function WinScreen({ state, dispatch, play }) {
  const { difficulty, moves, elapsedSeconds, players } = state
  const stars = getStarRating(difficulty, moves)
  const is2P = players.length > 1

  useEffect(() => {
    play('win')
    confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, colors: ['#a78bfa', '#f9a8d4', '#93c5fd', '#fde68a'] })
  }, [])

  const winnerIdx = is2P
    ? players[0].score > players[1].score ? 0 : players[1].score > players[0].score ? 1 : -1
    : -1

  return (
    <div className={styles.screen}>
      <div className={styles.trophy}>🏆</div>
      <h1 className={styles.title}>{is2P && winnerIdx >= 0 ? `${players[winnerIdx].name} Wins!` : 'You Won!'}</h1>
      <div className={styles.stars}>{'⭐'.repeat(stars)}{'☆'.repeat(3 - stars)}</div>

      {!is2P ? (
        <div className={styles.stats}>
          <div className={styles.stat}>
            <div className={styles.statVal}>{formatTime(elapsedSeconds)}</div>
            <div className={styles.statLbl}>Time</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statVal}>{moves}</div>
            <div className={styles.statLbl}>Moves</div>
          </div>
        </div>
      ) : (
        <div className={styles.scores}>
          {players.map((p, i) => (
            <div key={i} className={`${styles.scoreBox} ${i === winnerIdx ? styles.winner : ''}`}>
              <div className={styles.scoreName}>{p.name}</div>
              <div className={styles.scoreVal}>{p.score}</div>
              <div className={styles.scoreLbl}>pairs</div>
            </div>
          ))}
        </div>
      )}

      <button className={styles.btnPrimary} onClick={() => dispatch({ type: 'NAVIGATE', screen: 'difficulty' })}>
        🔄 Play Again
      </button>
      <button className={styles.btnSecondary} onClick={() => dispatch({ type: 'NAVIGATE', screen: 'home' })}>
        🏠 Home
      </button>
    </div>
  )
}
