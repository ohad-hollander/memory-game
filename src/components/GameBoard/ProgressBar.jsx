// src/components/GameBoard/ProgressBar.jsx
import styles from './ProgressBar.module.css'

export default function ProgressBar({ pairsFound, totalPairs }) {
  const pct = totalPairs > 0 ? (pairsFound / totalPairs) * 100 : 0
  return (
    <div className={styles.wrap}>
      <div className={styles.track}>
        <div className={styles.fill} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
