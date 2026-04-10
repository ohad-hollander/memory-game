// src/components/TwoPlayerSetup/TwoPlayerSetup.jsx
import { useState } from 'react'
import styles from './TwoPlayerSetup.module.css'

export default function TwoPlayerSetup({ dispatch }) {
  const [name1, setName1] = useState('')
  const [name2, setName2] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    const p1 = name1.trim() || 'Player 1'
    const p2 = name2.trim() || 'Player 2'
    dispatch({ type: 'SET_PLAYERS', players: [{ name: p1, score: 0 }, { name: p2, score: 0 }] })
    dispatch({ type: 'NAVIGATE', screen: 'difficulty' })
  }

  return (
    <div className={styles.screen}>
      <div style={{ fontSize: '2rem' }}>👥</div>
      <h1 className={styles.title}>Who's Playing?</h1>
      <p className={styles.subtitle}>Enter your names to get started</p>
      <form className={styles.form} onSubmit={handleSubmit}>
        <input
          className={styles.input}
          value={name1}
          onChange={e => setName1(e.target.value)}
          placeholder="Player 1 name"
          maxLength={20}
          autoFocus
        />
        <input
          className={styles.input}
          value={name2}
          onChange={e => setName2(e.target.value)}
          placeholder="Player 2 name"
          maxLength={20}
        />
        <button className={styles.btnPrimary} type="submit">
          Let's Go! →
        </button>
      </form>
      <button className={styles.btnBack} onClick={() => dispatch({ type: 'NAVIGATE', screen: 'home' })}>
        ← Back
      </button>
    </div>
  )
}
