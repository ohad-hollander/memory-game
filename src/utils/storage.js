const GAME_KEY = 'memoryGame_savedGame'
const SCORE_KEY = 'memoryGame_highScore'

export function saveGame(state) {
  try {
    localStorage.setItem(GAME_KEY, JSON.stringify(state))
  } catch (_) {}
}

export function loadGame() {
  try {
    const raw = localStorage.getItem(GAME_KEY)
    return raw ? JSON.parse(raw) : null
  } catch (_) {
    return null
  }
}

export function clearGame() {
  localStorage.removeItem(GAME_KEY)
}

export function saveHighScore(difficulty, score) {
  try {
    const all = JSON.parse(localStorage.getItem(SCORE_KEY) || '{}')
    const existing = all[difficulty]
    if (!existing || score.moves < existing.moves) {
      all[difficulty] = score
      localStorage.setItem(SCORE_KEY, JSON.stringify(all))
    }
  } catch (_) {}
}

export function loadHighScore(difficulty) {
  try {
    const all = JSON.parse(localStorage.getItem(SCORE_KEY) || '{}')
    return all[difficulty] ?? null
  } catch (_) {
    return null
  }
}
