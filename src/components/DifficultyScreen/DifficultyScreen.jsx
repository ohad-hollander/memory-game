// src/components/DifficultyScreen/DifficultyScreen.jsx
import { buildCards } from '../../gameReducer'
import styles from './DifficultyScreen.module.css'

const LEVELS = [
  { key: 'easy',   label: '🌱 Easy',   sub: '4×4 · 8 pairs · No timer',         badge: '4×4' },
  { key: 'medium', label: '🌟 Medium', sub: '4×6 · 12 pairs · Timer',            badge: '4×6' },
  { key: 'hard',   label: '🔥 Hard',   sub: '6×6 · 18 pairs · 3 min countdown',  badge: '6×6' },
]

export default function DifficultyScreen({ state, dispatch, photos }) {
  function startGame(difficulty) {
    const cards = buildCards(photos, difficulty)
    dispatch({
      type: 'START_GAME',
      difficulty,
      players: state.players.length > 1 ? state.players : [{ name: '', score: 0 }],
      cards,
    })
  }

  return (
    <div className={styles.screen}>
      <div style={{ fontSize: '2rem' }}>🃏</div>
      <h1 className={styles.title}>Choose Difficulty</h1>
      <p className={styles.subtitle}>How challenging do you want it?</p>
      <div className={styles.options}>
        {LEVELS.map(({ key, label, sub, badge }) => (
          <button key={key} className={styles.option} onClick={() => startGame(key)}>
            <div className={styles.optionLeft}>
              <div className={styles.optionName}>{label}</div>
              <div className={styles.optionSub}>{sub}</div>
            </div>
            <div className={styles.badge}>{badge}</div>
          </button>
        ))}
      </div>
      <button className={styles.btnBack} onClick={() => dispatch({ type: 'NAVIGATE', screen: 'home' })}>
        ← Back
      </button>
    </div>
  )
}
