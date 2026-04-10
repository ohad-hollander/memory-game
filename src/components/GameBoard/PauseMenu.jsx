// src/components/GameBoard/PauseMenu.jsx
import styles from './PauseMenu.module.css'

export default function PauseMenu({ dispatch }) {
  return (
    <div className={styles.overlay}>
      <div className={styles.box}>
        <div className={styles.title}>⏸ Paused</div>
        <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => dispatch({ type: 'RESUME' })}>
          ▶ Resume
        </button>
        <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => dispatch({ type: 'NAVIGATE', screen: 'difficulty' })}>
          🔄 Restart
        </button>
        <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => dispatch({ type: 'NAVIGATE', screen: 'home' })}>
          🏠 Quit
        </button>
      </div>
    </div>
  )
}
