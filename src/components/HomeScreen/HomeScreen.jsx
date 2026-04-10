// src/components/HomeScreen/HomeScreen.jsx
import { useEffect, useState } from 'react'
import { loadGame, clearGame, loadHighScore } from '../../utils/storage'
import styles from './HomeScreen.module.css'

function formatTime(s) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

export default function HomeScreen({ dispatch }) {
  const [savedGame, setSavedGame] = useState(null)
  const [scores, setScores] = useState({})

  useEffect(() => {
    setSavedGame(loadGame())
    setScores({
      easy:   loadHighScore('easy'),
      medium: loadHighScore('medium'),
      hard:   loadHighScore('hard'),
    })
  }, [])

  function resumeGame() {
    if (savedGame) dispatch({ type: 'RESTORE', state: savedGame })
  }

  function dismissResume() {
    clearGame()
    setSavedGame(null)
  }

  const scoreLabels = { easy: 'Easy', medium: 'Medium', hard: 'Hard' }

  return (
    <div className={styles.screen}>
      <div className={styles.emoji}>🌸</div>
      <h1 className={styles.title}>Memory</h1>
      <p className={styles.subtitle}>Find all the matching pairs!</p>

      <div className={styles.cardPreview}>
        <div className={`${styles.miniCard} ${styles.miniBack}`}>✦</div>
        <div className={styles.miniCard} style={{ background: '#ffd6e7' }}>🌸</div>
        <div className={`${styles.miniCard} ${styles.miniBack}`}>✦</div>
        <div className={styles.miniCard} style={{ background: '#d1fae5' }}>🌿</div>
      </div>

      {savedGame && (
        <div className={styles.resumeBox}>
          <div className={styles.resumeTitle}>▶ Game in progress</div>
          <div className={styles.resumeSub}>{savedGame.pairsFound}/{savedGame.totalPairs} pairs · {savedGame.moves} moves</div>
          <div className={styles.resumeActions}>
            <button className={styles.resumeYes} onClick={resumeGame}>Resume</button>
            <button className={styles.resumeNo} onClick={dismissResume}>New Game</button>
          </div>
        </div>
      )}

      <button className={styles.btnPrimary} onClick={() => dispatch({ type: 'NAVIGATE', screen: 'difficulty' })}>
        ▶ Play Solo
      </button>
      <button className={styles.btnSecondary} onClick={() => dispatch({ type: 'NAVIGATE', screen: 'setup' })}>
        👥 2 Players
      </button>

      {Object.entries(scoreLabels).some(([k]) => scores[k]) && (
        <div className={styles.bestScores}>
          {Object.entries(scoreLabels).map(([key, label]) =>
            scores[key] ? (
              <p key={key} className={styles.bestScore}>
                🏆 {label}: {scores[key].moves} moves · {formatTime(scores[key].seconds)}
              </p>
            ) : null
          )}
        </div>
      )}
    </div>
  )
}
