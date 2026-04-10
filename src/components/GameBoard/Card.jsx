// src/components/GameBoard/Card.jsx
import { useState } from 'react'
import styles from './Card.module.css'

export default function Card({ card, onClick }) {
  const { id, src, label, isFlipped, isMatched, borderColor } = card
  const [imgError, setImgError] = useState(false)

  function handleClick() {
    if (isFlipped || isMatched) return
    onClick(id)
  }

  const cls = [
    styles.card,
    isFlipped || isMatched ? styles.flipped : '',
    isMatched ? styles.matched : '',
  ].join(' ')

  return (
    <button
      className={cls}
      onClick={handleClick}
      aria-label={isFlipped || isMatched ? label : 'Hidden card'}
      style={{ '--border-color': borderColor }}
    >
      <div className={styles.inner}>
        {/* Back */}
        <div className={styles.face + ' ' + styles.back}>
          <div className={styles.backPattern}>✦ ✦ ✦{'\n'}✦ ✦ ✦{'\n'}✦ ✦ ✦</div>
        </div>
        {/* Front */}
        <div className={styles.face + ' ' + styles.front}>
          {!imgError ? (
            <img
              className={styles.photo}
              src={src}
              alt={label}
              onError={() => setImgError(true)}
              draggable={false}
            />
          ) : (
            <div className={styles.photoFallback}>{label}</div>
          )}
        </div>
      </div>
    </button>
  )
}
