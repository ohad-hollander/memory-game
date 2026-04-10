// src/components/GameBoard/CardGrid.jsx
import { DIFFICULTY_CONFIG } from '../../constants'
import Card from './Card'
import styles from './CardGrid.module.css'

export default function CardGrid({ cards, difficulty, onCardClick }) {
  const { cols } = DIFFICULTY_CONFIG[difficulty]
  const colsClass = cols === 6 ? styles.cols6 : styles.cols4
  return (
    <div className={`${styles.grid} ${colsClass}`}>
      {cards.map(card => (
        <Card key={card.id} card={card} onClick={onCardClick} />
      ))}
    </div>
  )
}
