# Memory Game Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a beautiful, responsive pastel memory card game in React + Vite with custom family photos, 1-player and 2-player hot-seat modes, timer, hints, sounds, and win celebration.

**Architecture:** A single `useReducer` at the `App` level owns all game state and drives screen navigation. Pure utility functions (shuffle, storage, starRating) are tested in isolation. React components receive state and dispatch as props — no global context needed.

**Tech Stack:** React 18, Vite, CSS Modules, Vitest, @testing-library/react, Howler.js, canvas-confetti

---

## File Structure

```
Memory_Game/
├── public/
│   ├── photos/               ← drop your photos here (e.g. beach.jpg)
│   └── sounds/
│       ├── flip.mp3
│       ├── match.mp3
│       ├── no-match.mp3
│       └── win.mp3
├── src/
│   ├── main.jsx
│   ├── setupTests.js
│   ├── App.jsx
│   ├── App.module.css
│   ├── photos.config.js      ← list your photos here
│   ├── constants.js          ← DIFFICULTY_CONFIG, BORDER_COLORS
│   ├── gameReducer.js        ← all state logic
│   ├── gameReducer.test.js
│   ├── utils/
│   │   ├── shuffle.js
│   │   ├── shuffle.test.js
│   │   ├── storage.js
│   │   ├── storage.test.js
│   │   ├── starRating.js
│   │   └── starRating.test.js
│   ├── hooks/
│   │   ├── useGameTimer.js
│   │   ├── useSound.js
│   │   └── useFullscreen.js
│   └── components/
│       ├── HomeScreen/
│       │   ├── HomeScreen.jsx
│       │   └── HomeScreen.module.css
│       ├── TwoPlayerSetup/
│       │   ├── TwoPlayerSetup.jsx
│       │   └── TwoPlayerSetup.module.css
│       ├── DifficultyScreen/
│       │   ├── DifficultyScreen.jsx
│       │   └── DifficultyScreen.module.css
│       ├── PeekScreen/
│       │   ├── PeekScreen.jsx
│       │   └── PeekScreen.module.css
│       ├── GameBoard/
│       │   ├── GameBoard.jsx
│       │   ├── GameBoard.module.css
│       │   ├── HUD.jsx
│       │   ├── HUD.module.css
│       │   ├── ProgressBar.jsx
│       │   ├── ProgressBar.module.css
│       │   ├── CardGrid.jsx
│       │   ├── CardGrid.module.css
│       │   ├── Card.jsx
│       │   ├── Card.module.css
│       │   ├── PauseMenu.jsx
│       │   └── PauseMenu.module.css
│       └── WinScreen/
│           ├── WinScreen.jsx
│           └── WinScreen.module.css
├── index.html
├── package.json
└── vite.config.js
```

---

## Task 1: Project Setup

**Files:**
- Create: `package.json`, `vite.config.js`, `src/main.jsx`, `src/setupTests.js`, `index.html`

- [ ] **Step 1: Scaffold the project**

```bash
cd /Users/ohad/projects/Memory_Game
npm create vite@latest . -- --template react
```

When prompted "Current directory is not empty. Remove existing files and continue?" — choose **Yes**.

- [ ] **Step 2: Install dependencies**

```bash
npm install
npm install howler canvas-confetti
npm install -D vitest @vitest/coverage-v8 @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

- [ ] **Step 3: Configure Vitest inside vite.config.js**

Replace the contents of `vite.config.js` with:

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
  },
})
```

- [ ] **Step 4: Create src/setupTests.js**

```js
import '@testing-library/jest-dom'
```

- [ ] **Step 5: Add test scripts to package.json**

Open `package.json` and add to the `"scripts"` block:

```json
"test": "vitest",
"test:run": "vitest run",
"coverage": "vitest run --coverage"
```

- [ ] **Step 6: Create the sounds and photos directories**

```bash
mkdir -p public/photos public/sounds
```

- [ ] **Step 7: Verify the dev server starts**

```bash
npm run dev
```

Expected: `VITE v5.x ready` with a localhost URL. Open it — you should see the default Vite + React page. Press Ctrl+C.

- [ ] **Step 8: Verify tests run**

```bash
npm run test:run
```

Expected: `No test files found` (that's fine — no tests yet).

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: scaffold React + Vite project with Vitest"
```

---

## Task 2: Constants and Photos Config

**Files:**
- Create: `src/constants.js`
- Create: `src/photos.config.js`

- [ ] **Step 1: Create src/constants.js**

```js
export const DIFFICULTY_CONFIG = {
  easy:   { cols: 4, rows: 4, pairs: 8,  peekSeconds: 3, countdown: null },
  medium: { cols: 4, rows: 6, pairs: 12, peekSeconds: 2, countdown: null },
  hard:   { cols: 6, rows: 6, pairs: 18, peekSeconds: 1, countdown: 180  },
}

export const BORDER_COLORS = [
  '#fda4af', // pink
  '#6ee7b7', // mint
  '#93c5fd', // blue
  '#fde68a', // yellow
  '#c4b5fd', // lavender
  '#fdba74', // peach
  '#86efac', // light green
  '#f9a8d4', // light pink
  '#67e8f9', // cyan
  '#a5b4fc', // indigo
  '#fcd34d', // amber
  '#fb7185', // rose
  '#34d399', // emerald
  '#60a5fa', // sky
  '#e879f9', // fuchsia
  '#4ade80', // green
  '#f472b6', // hot pink
  '#38bdf8', // light blue
]
```

- [ ] **Step 2: Create src/photos.config.js**

This is the file you edit to add your own photos. Each entry needs a unique `id`, the filename in `public/photos/`, and an optional label.

```js
// Add your photos to public/photos/ then list them here.
// The game needs at least 18 photos for Hard mode (6×6).
// For Easy mode (4×4) you need at least 8.

export const photos = [
  { id: 1,  src: '/photos/photo01.jpg', label: 'Memory 1'  },
  { id: 2,  src: '/photos/photo02.jpg', label: 'Memory 2'  },
  { id: 3,  src: '/photos/photo03.jpg', label: 'Memory 3'  },
  { id: 4,  src: '/photos/photo04.jpg', label: 'Memory 4'  },
  { id: 5,  src: '/photos/photo05.jpg', label: 'Memory 5'  },
  { id: 6,  src: '/photos/photo06.jpg', label: 'Memory 6'  },
  { id: 7,  src: '/photos/photo07.jpg', label: 'Memory 7'  },
  { id: 8,  src: '/photos/photo08.jpg', label: 'Memory 8'  },
  { id: 9,  src: '/photos/photo09.jpg', label: 'Memory 9'  },
  { id: 10, src: '/photos/photo10.jpg', label: 'Memory 10' },
  { id: 11, src: '/photos/photo11.jpg', label: 'Memory 11' },
  { id: 12, src: '/photos/photo12.jpg', label: 'Memory 12' },
  { id: 13, src: '/photos/photo13.jpg', label: 'Memory 13' },
  { id: 14, src: '/photos/photo14.jpg', label: 'Memory 14' },
  { id: 15, src: '/photos/photo15.jpg', label: 'Memory 15' },
  { id: 16, src: '/photos/photo16.jpg', label: 'Memory 16' },
  { id: 17, src: '/photos/photo17.jpg', label: 'Memory 17' },
  { id: 18, src: '/photos/photo18.jpg', label: 'Memory 18' },
]
```

- [ ] **Step 3: Commit**

```bash
git add src/constants.js src/photos.config.js
git commit -m "feat: add difficulty config, border colors, and photos config"
```

---

## Task 3: Utility — shuffle

**Files:**
- Create: `src/utils/shuffle.js`
- Create: `src/utils/shuffle.test.js`

- [ ] **Step 1: Write the failing test**

```js
// src/utils/shuffle.test.js
import { shuffle } from './shuffle'

describe('shuffle', () => {
  it('returns an array of the same length', () => {
    expect(shuffle([1, 2, 3, 4])).toHaveLength(4)
  })

  it('contains all the same elements', () => {
    const input = [1, 2, 3, 4, 5]
    const result = shuffle(input)
    expect(result.sort()).toEqual([...input].sort())
  })

  it('does not mutate the original array', () => {
    const input = [1, 2, 3]
    shuffle(input)
    expect(input).toEqual([1, 2, 3])
  })

  it('handles an empty array', () => {
    expect(shuffle([])).toEqual([])
  })

  it('handles a single element', () => {
    expect(shuffle([42])).toEqual([42])
  })
})
```

- [ ] **Step 2: Run the test to confirm it fails**

```bash
npm run test:run -- src/utils/shuffle.test.js
```

Expected: FAIL — `Cannot find module './shuffle'`

- [ ] **Step 3: Implement shuffle**

```js
// src/utils/shuffle.js

/**
 * Fisher-Yates shuffle — returns a new shuffled array, does not mutate input.
 * @param {Array} array
 * @returns {Array}
 */
export function shuffle(array) {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}
```

- [ ] **Step 4: Run the test to confirm it passes**

```bash
npm run test:run -- src/utils/shuffle.test.js
```

Expected: PASS — 5 tests

- [ ] **Step 5: Commit**

```bash
git add src/utils/shuffle.js src/utils/shuffle.test.js
git commit -m "feat: add Fisher-Yates shuffle utility"
```

---

## Task 4: Utility — localStorage helpers

**Files:**
- Create: `src/utils/storage.js`
- Create: `src/utils/storage.test.js`

- [ ] **Step 1: Write the failing tests**

```js
// src/utils/storage.test.js
import { saveGame, loadGame, clearGame, saveHighScore, loadHighScore } from './storage'

describe('storage', () => {
  beforeEach(() => localStorage.clear())

  describe('saveGame / loadGame / clearGame', () => {
    it('saves and loads game state', () => {
      const state = { screen: 'game', moves: 5 }
      saveGame(state)
      expect(loadGame()).toEqual(state)
    })

    it('returns null when nothing saved', () => {
      expect(loadGame()).toBeNull()
    })

    it('clearGame removes saved state', () => {
      saveGame({ screen: 'game' })
      clearGame()
      expect(loadGame()).toBeNull()
    })
  })

  describe('saveHighScore / loadHighScore', () => {
    it('saves and loads a high score for a difficulty', () => {
      saveHighScore('easy', { moves: 10, seconds: 45 })
      expect(loadHighScore('easy')).toEqual({ moves: 10, seconds: 45 })
    })

    it('returns null when no score saved for that difficulty', () => {
      expect(loadHighScore('hard')).toBeNull()
    })

    it('overwrites existing score', () => {
      saveHighScore('easy', { moves: 20, seconds: 90 })
      saveHighScore('easy', { moves: 10, seconds: 45 })
      expect(loadHighScore('easy')).toEqual({ moves: 10, seconds: 45 })
    })
  })
})
```

- [ ] **Step 2: Run to confirm failure**

```bash
npm run test:run -- src/utils/storage.test.js
```

Expected: FAIL — `Cannot find module './storage'`

- [ ] **Step 3: Implement storage helpers**

```js
// src/utils/storage.js
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
    all[difficulty] = score
    localStorage.setItem(SCORE_KEY, JSON.stringify(all))
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
```

- [ ] **Step 4: Run to confirm all pass**

```bash
npm run test:run -- src/utils/storage.test.js
```

Expected: PASS — 6 tests

- [ ] **Step 5: Commit**

```bash
git add src/utils/storage.js src/utils/storage.test.js
git commit -m "feat: add localStorage helpers for game save and high scores"
```

---

## Task 5: Utility — star rating

**Files:**
- Create: `src/utils/starRating.js`
- Create: `src/utils/starRating.test.js`

- [ ] **Step 1: Write the failing tests**

```js
// src/utils/starRating.test.js
import { getStarRating } from './starRating'

describe('getStarRating', () => {
  // Easy: 8 pairs → thresholds 12 moves (3★), 20 moves (2★)
  it('returns 3 stars for moves at or below 1.5× pairs', () => {
    expect(getStarRating('easy', 12)).toBe(3)
    expect(getStarRating('easy', 8)).toBe(3)
  })

  it('returns 2 stars for moves between 1.5× and 2.5× pairs', () => {
    expect(getStarRating('easy', 13)).toBe(2)
    expect(getStarRating('easy', 20)).toBe(2)
  })

  it('returns 1 star for moves above 2.5× pairs', () => {
    expect(getStarRating('easy', 21)).toBe(1)
    expect(getStarRating('easy', 50)).toBe(1)
  })

  it('applies correct thresholds for medium (12 pairs)', () => {
    expect(getStarRating('medium', 18)).toBe(3)
    expect(getStarRating('medium', 19)).toBe(2)
    expect(getStarRating('medium', 31)).toBe(1)
  })

  it('applies correct thresholds for hard (18 pairs)', () => {
    expect(getStarRating('hard', 27)).toBe(3)
    expect(getStarRating('hard', 28)).toBe(2)
    expect(getStarRating('hard', 46)).toBe(1)
  })
})
```

- [ ] **Step 2: Run to confirm failure**

```bash
npm run test:run -- src/utils/starRating.test.js
```

Expected: FAIL — `Cannot find module './starRating'`

- [ ] **Step 3: Implement starRating**

```js
// src/utils/starRating.js
import { DIFFICULTY_CONFIG } from '../constants'

/**
 * Returns 1, 2, or 3 stars based on moves relative to number of pairs.
 * 3★ ≤ pairs × 1.5
 * 2★ ≤ pairs × 2.5
 * 1★ otherwise
 */
export function getStarRating(difficulty, moves) {
  const { pairs } = DIFFICULTY_CONFIG[difficulty]
  if (moves <= pairs * 1.5) return 3
  if (moves <= pairs * 2.5) return 2
  return 1
}
```

- [ ] **Step 4: Run to confirm all pass**

```bash
npm run test:run -- src/utils/starRating.test.js
```

Expected: PASS — 5 tests

- [ ] **Step 5: Commit**

```bash
git add src/utils/starRating.js src/utils/starRating.test.js
git commit -m "feat: add star rating utility"
```

---

## Task 6: Game Reducer

**Files:**
- Create: `src/gameReducer.js`
- Create: `src/gameReducer.test.js`

- [ ] **Step 1: Write the failing tests**

```js
// src/gameReducer.test.js
import { gameReducer, initialState, buildCards } from './gameReducer'

// Helpers
const makePhotos = (n) =>
  Array.from({ length: n }, (_, i) => ({
    id: i + 1, src: `/photos/photo${i + 1}.jpg`, label: `Photo ${i + 1}`,
  }))

describe('buildCards', () => {
  it('creates 2 cards per photo', () => {
    const cards = buildCards(makePhotos(4), 'easy')
    expect(cards).toHaveLength(8)
  })

  it('each pair shares the same photoId', () => {
    const cards = buildCards(makePhotos(4), 'easy')
    const byPhoto = {}
    cards.forEach(c => { byPhoto[c.photoId] = (byPhoto[c.photoId] || 0) + 1 })
    Object.values(byPhoto).forEach(count => expect(count).toBe(2))
  })

  it('all cards start face-up (for peek)', () => {
    const cards = buildCards(makePhotos(4), 'easy')
    cards.forEach(c => expect(c.isFlipped).toBe(true))
  })

  it('all cards start unmatched', () => {
    const cards = buildCards(makePhotos(4), 'easy')
    cards.forEach(c => expect(c.isMatched).toBe(false))
  })
})

describe('gameReducer', () => {
  describe('NAVIGATE', () => {
    it('changes screen', () => {
      const state = gameReducer(initialState, { type: 'NAVIGATE', screen: 'difficulty' })
      expect(state.screen).toBe('difficulty')
    })
  })

  describe('START_GAME', () => {
    it('sets screen to peek', () => {
      const cards = buildCards(makePhotos(8), 'easy')
      const state = gameReducer(initialState, {
        type: 'START_GAME',
        difficulty: 'easy',
        players: [{ name: 'Alice', score: 0 }],
        cards,
      })
      expect(state.screen).toBe('peek')
    })

    it('resets moves and pairsFound', () => {
      const cards = buildCards(makePhotos(8), 'easy')
      const state = gameReducer(
        { ...initialState, moves: 99, pairsFound: 5 },
        { type: 'START_GAME', difficulty: 'easy', players: [{ name: 'Alice', score: 0 }], cards },
      )
      expect(state.moves).toBe(0)
      expect(state.pairsFound).toBe(0)
    })
  })

  describe('PEEK_DONE', () => {
    it('flips all cards face-down and sets screen to game', () => {
      const cards = buildCards(makePhotos(8), 'easy')
      const peekState = { ...initialState, screen: 'peek', cards }
      const state = gameReducer(peekState, { type: 'PEEK_DONE' })
      expect(state.screen).toBe('game')
      state.cards.forEach(c => expect(c.isFlipped).toBe(false))
    })
  })

  describe('FLIP_CARD', () => {
    const getGameState = () => {
      const cards = buildCards(makePhotos(8), 'easy').map(c => ({ ...c, isFlipped: false }))
      return { ...initialState, screen: 'game', cards, totalPairs: 8 }
    }

    it('flips an unflipped card', () => {
      const state = getGameState()
      const cardId = state.cards[0].id
      const next = gameReducer(state, { type: 'FLIP_CARD', id: cardId })
      expect(next.cards.find(c => c.id === cardId).isFlipped).toBe(true)
    })

    it('ignores flip on matched card', () => {
      const state = getGameState()
      const matchedCard = { ...state.cards[0], isMatched: true }
      const cards = state.cards.map(c => c.id === matchedCard.id ? matchedCard : c)
      const next = gameReducer({ ...state, cards }, { type: 'FLIP_CARD', id: matchedCard.id })
      expect(next).toEqual({ ...state, cards })
    })

    it('ignores flip when isEvaluating', () => {
      const state = { ...getGameState(), isEvaluating: true }
      const next = gameReducer(state, { type: 'FLIP_CARD', id: state.cards[0].id })
      expect(next).toEqual(state)
    })

    it('sets isEvaluating and increments moves when 2nd non-matching card flipped', () => {
      const state = getGameState()
      // Find two cards with different photoIds
      const card1 = state.cards[0]
      const card2 = state.cards.find(c => c.photoId !== card1.photoId)
      const after1 = gameReducer(state, { type: 'FLIP_CARD', id: card1.id })
      const after2 = gameReducer(after1, { type: 'FLIP_CARD', id: card2.id })
      expect(after2.isEvaluating).toBe(true)
      expect(after2.moves).toBe(1)
    })

    it('marks matching pair as matched and does not set isEvaluating', () => {
      const state = getGameState()
      const card1 = state.cards[0]
      const card2 = state.cards.find(c => c.id !== card1.id && c.photoId === card1.photoId)
      const after1 = gameReducer(state, { type: 'FLIP_CARD', id: card1.id })
      const after2 = gameReducer(after1, { type: 'FLIP_CARD', id: card2.id })
      expect(after2.cards.find(c => c.id === card1.id).isMatched).toBe(true)
      expect(after2.cards.find(c => c.id === card2.id).isMatched).toBe(true)
      expect(after2.isEvaluating).toBe(false)
      expect(after2.pairsFound).toBe(1)
    })

    it('sets screen to win when last pair is matched', () => {
      // Arrange: only one unmatched pair remains
      const photos = makePhotos(2)
      const cards = buildCards(photos, 'easy').map(c => ({ ...c, isFlipped: false }))
      const [c1, c2] = cards.filter(c => c.photoId === 1)
      const allMatched = cards.map(c => c.photoId === 2 ? { ...c, isMatched: true } : c)
      const state = { ...initialState, screen: 'game', cards: allMatched, totalPairs: 2, pairsFound: 1 }
      const after1 = gameReducer(state, { type: 'FLIP_CARD', id: c1.id })
      const after2 = gameReducer(after1, { type: 'FLIP_CARD', id: c2.id })
      expect(after2.screen).toBe('win')
    })
  })

  describe('RESOLVE_FLIP', () => {
    it('unflips the two non-matched cards and clears isEvaluating', () => {
      const cards = buildCards(makePhotos(8), 'easy').map(c => ({ ...c, isFlipped: false }))
      const card1 = cards[0]
      const card2 = cards.find(c => c.photoId !== card1.photoId)
      const evaluatingState = {
        ...initialState, screen: 'game', cards: cards.map(c =>
          c.id === card1.id || c.id === card2.id ? { ...c, isFlipped: true } : c
        ),
        flippedIds: [card1.id, card2.id],
        isEvaluating: true,
        totalPairs: 8,
      }
      const next = gameReducer(evaluatingState, { type: 'RESOLVE_FLIP' })
      expect(next.isEvaluating).toBe(false)
      expect(next.cards.find(c => c.id === card1.id).isFlipped).toBe(false)
      expect(next.cards.find(c => c.id === card2.id).isFlipped).toBe(false)
      expect(next.flippedIds).toEqual([])
    })

    it('advances to next player in 2-player mode on mismatch', () => {
      const cards = buildCards(makePhotos(8), 'easy').map(c => ({ ...c, isFlipped: false }))
      const evaluatingState = {
        ...initialState,
        players: [{ name: 'A', score: 0 }, { name: 'B', score: 0 }],
        activePlayer: 0,
        cards,
        flippedIds: [cards[0].id, cards[2].id],
        isEvaluating: true,
        totalPairs: 8,
      }
      const next = gameReducer(evaluatingState, { type: 'RESOLVE_FLIP' })
      expect(next.activePlayer).toBe(1)
    })
  })

  describe('TICK', () => {
    it('increments elapsedSeconds when not paused', () => {
      const state = { ...initialState, screen: 'game', isPaused: false }
      expect(gameReducer(state, { type: 'TICK' }).elapsedSeconds).toBe(1)
    })

    it('does not increment when paused', () => {
      const state = { ...initialState, screen: 'game', isPaused: true }
      expect(gameReducer(state, { type: 'TICK' }).elapsedSeconds).toBe(0)
    })
  })

  describe('PAUSE / RESUME', () => {
    it('sets isPaused to true', () => {
      expect(gameReducer(initialState, { type: 'PAUSE' }).isPaused).toBe(true)
    })
    it('sets isPaused to false', () => {
      expect(gameReducer({ ...initialState, isPaused: true }, { type: 'RESUME' }).isPaused).toBe(false)
    })
  })

  describe('TOGGLE_MUTE', () => {
    it('toggles isMuted', () => {
      expect(gameReducer(initialState, { type: 'TOGGLE_MUTE' }).isMuted).toBe(true)
      expect(gameReducer({ ...initialState, isMuted: true }, { type: 'TOGGLE_MUTE' }).isMuted).toBe(false)
    })
  })
})
```

- [ ] **Step 2: Run to confirm failure**

```bash
npm run test:run -- src/gameReducer.test.js
```

Expected: FAIL — `Cannot find module './gameReducer'`

- [ ] **Step 3: Implement the game reducer**

```js
// src/gameReducer.js
import { shuffle } from './utils/shuffle'
import { DIFFICULTY_CONFIG, BORDER_COLORS } from './constants'

export const initialState = {
  screen: 'home',          // 'home' | 'setup' | 'difficulty' | 'peek' | 'game' | 'win'
  difficulty: 'easy',
  players: [{ name: '', score: 0 }],
  activePlayer: 0,
  cards: [],
  flippedIds: [],           // 0, 1, or 2 card IDs currently face-up and unmatched
  isEvaluating: false,      // true during the 1-second pause before unflipping mismatches
  moves: 0,
  elapsedSeconds: 0,
  hintsUsed: 0,
  pairsFound: 0,
  totalPairs: 0,
  isPaused: false,
  isMuted: false,
}

/**
 * Build a shuffled array of card objects from a photos array.
 * Each photo produces 2 cards. All start face-up (for the peek phase).
 */
export function buildCards(photos, difficulty) {
  const { pairs } = DIFFICULTY_CONFIG[difficulty]
  const selected = photos.slice(0, pairs)
  const cardPairs = selected.flatMap((photo, i) => {
    const borderColor = BORDER_COLORS[i % BORDER_COLORS.length]
    return [
      { id: `${photo.id}-a`, photoId: photo.id, src: photo.src, label: photo.label, isFlipped: true, isMatched: false, borderColor },
      { id: `${photo.id}-b`, photoId: photo.id, src: photo.src, label: photo.label, isFlipped: true, isMatched: false, borderColor },
    ]
  })
  return shuffle(cardPairs)
}

export function gameReducer(state, action) {
  switch (action.type) {

    case 'NAVIGATE':
      return { ...state, screen: action.screen }

    case 'START_GAME': {
      const { difficulty, players, cards } = action
      const { pairs } = DIFFICULTY_CONFIG[difficulty]
      return {
        ...initialState,
        screen: 'peek',
        difficulty,
        players,
        cards,
        totalPairs: pairs,
        isMuted: state.isMuted,  // preserve mute preference
      }
    }

    case 'PEEK_DONE':
      return {
        ...state,
        screen: 'game',
        cards: state.cards.map(c => ({ ...c, isFlipped: false })),
      }

    case 'FLIP_CARD': {
      const { id } = action
      const card = state.cards.find(c => c.id === id)
      if (!card || state.isEvaluating || card.isFlipped || card.isMatched) return state
      if (state.flippedIds.length >= 2) return state

      const newCards = state.cards.map(c => c.id === id ? { ...c, isFlipped: true } : c)
      const newFlippedIds = [...state.flippedIds, id]

      if (newFlippedIds.length < 2) {
        return { ...state, cards: newCards, flippedIds: newFlippedIds }
      }

      // Two cards flipped — check for match
      const [id1, id2] = newFlippedIds
      const c1 = newCards.find(c => c.id === id1)
      const c2 = newCards.find(c => c.id === id2)
      const isMatch = c1.photoId === c2.photoId

      if (isMatch) {
        const matchedCards = newCards.map(c =>
          newFlippedIds.includes(c.id) ? { ...c, isMatched: true } : c
        )
        const newPairsFound = state.pairsFound + 1
        const newPlayers = state.players.map((p, i) =>
          i === state.activePlayer ? { ...p, score: p.score + 1 } : p
        )
        return {
          ...state,
          cards: matchedCards,
          flippedIds: [],
          moves: state.moves + 1,
          pairsFound: newPairsFound,
          players: newPlayers,
          screen: newPairsFound === state.totalPairs ? 'win' : 'game',
        }
      }

      // No match — set evaluating flag; GameBoard dispatches RESOLVE_FLIP after 1s
      return {
        ...state,
        cards: newCards,
        flippedIds: newFlippedIds,
        isEvaluating: true,
        moves: state.moves + 1,
      }
    }

    case 'RESOLVE_FLIP': {
      const newCards = state.cards.map(c =>
        state.flippedIds.includes(c.id) ? { ...c, isFlipped: false } : c
      )
      const nextPlayer =
        state.players.length > 1
          ? (state.activePlayer + 1) % state.players.length
          : 0
      return {
        ...state,
        cards: newCards,
        flippedIds: [],
        isEvaluating: false,
        activePlayer: nextPlayer,
      }
    }

    case 'USE_HINT': {
      const { ids } = action  // [id1, id2] of an unmatched pair
      return {
        ...state,
        cards: state.cards.map(c => ids.includes(c.id) ? { ...c, isFlipped: true } : c),
        moves: state.moves + 2,
        hintsUsed: state.hintsUsed + 1,
        isEvaluating: true,
      }
    }

    case 'HINT_DONE': {
      const { ids } = action
      return {
        ...state,
        cards: state.cards.map(c =>
          ids.includes(c.id) && !c.isMatched ? { ...c, isFlipped: false } : c
        ),
        isEvaluating: false,
      }
    }

    case 'TICK':
      if (state.isPaused) return state
      return { ...state, elapsedSeconds: state.elapsedSeconds + 1 }

    case 'PAUSE':
      return { ...state, isPaused: true }

    case 'RESUME':
      return { ...state, isPaused: false }

    case 'TOGGLE_MUTE':
      return { ...state, isMuted: !state.isMuted }

    default:
      return state
  }
}
```

- [ ] **Step 4: Run tests to confirm all pass**

```bash
npm run test:run -- src/gameReducer.test.js
```

Expected: PASS — all tests green

- [ ] **Step 5: Commit**

```bash
git add src/gameReducer.js src/gameReducer.test.js
git commit -m "feat: implement game reducer with full state machine"
```

---

## Task 7: Hooks — useGameTimer, useSound, useFullscreen

**Files:**
- Create: `src/hooks/useGameTimer.js`
- Create: `src/hooks/useSound.js`
- Create: `src/hooks/useFullscreen.js`

- [ ] **Step 1: Create useGameTimer.js**

Fires a `TICK` action every second while the game screen is active and not paused.

```js
// src/hooks/useGameTimer.js
import { useEffect } from 'react'

export function useGameTimer(screen, isPaused, dispatch) {
  useEffect(() => {
    if (screen !== 'game' || isPaused) return
    const id = setInterval(() => dispatch({ type: 'TICK' }), 1000)
    return () => clearInterval(id)
  }, [screen, isPaused, dispatch])
}
```

- [ ] **Step 2: Add sound files to public/sounds/**

Download 4 free sound files (MP3 format) from [freesound.org](https://freesound.org) using these search terms:
- `flip.mp3` — search "card flip soft"
- `match.mp3` — search "chime ding soft"
- `no-match.mp3` — search "thud soft low"
- `win.mp3` — search "fanfare short cheerful"

Place them at:
```
public/sounds/flip.mp3
public/sounds/match.mp3
public/sounds/no-match.mp3
public/sounds/win.mp3
```

If you skip this step the game still works — sounds are silent when files are missing.

- [ ] **Step 3: Create useSound.js**

```js
// src/hooks/useSound.js
import { useEffect, useRef } from 'react'
import { Howl } from 'howler'

const SOUNDS = {
  flip:    '/sounds/flip.mp3',
  match:   '/sounds/match.mp3',
  noMatch: '/sounds/no-match.mp3',
  win:     '/sounds/win.mp3',
}

export function useSound(isMuted) {
  const howls = useRef({})

  useEffect(() => {
    const instances = {}
    for (const [key, src] of Object.entries(SOUNDS)) {
      instances[key] = new Howl({ src: [src], volume: 0.5, onloaderror: () => {} })
    }
    howls.current = instances
    return () => Object.values(instances).forEach(h => h.unload())
  }, [])

  function play(name) {
    if (isMuted) return
    howls.current[name]?.play()
  }

  return { play }
}
```

- [ ] **Step 4: Create useFullscreen.js**

```js
// src/hooks/useFullscreen.js
import { useState, useCallback } from 'react'

export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false)

  const toggle = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {})
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {})
    }
  }, [])

  return { isFullscreen, toggle }
}
```

- [ ] **Step 5: Commit**

```bash
git add src/hooks/
git commit -m "feat: add useGameTimer, useSound, and useFullscreen hooks"
```

---

## Task 8: Global Styles and App Shell

**Files:**
- Modify: `src/main.jsx`
- Modify: `index.html`
- Create: `src/App.jsx`
- Create: `src/App.module.css`

- [ ] **Step 1: Update index.html**

Replace the contents of `index.html` with:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🌸</text></svg>" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#fdf4ff" />
    <title>Memory Game</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 2: Update src/main.jsx**

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 3: Replace src/index.css with global pastel styles**

```css
/* src/index.css */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg-gradient: linear-gradient(160deg, #fdf4ff 0%, #fce7f3 50%, #eff6ff 100%);
  --purple:      #7c3aed;
  --purple-light:#a78bfa;
  --pink:        #ec4899;
  --pink-light:  #f9a8d4;
  --text:        #1e1b4b;
  --text-muted:  #9ca3af;
  --card-radius: 14px;
  --shadow-sm:   0 2px 8px rgba(0,0,0,0.08);
  --shadow-md:   0 4px 16px rgba(0,0,0,0.12);
  --shadow-lg:   0 8px 32px rgba(0,0,0,0.16);
}

html, body, #root {
  height: 100%;
  width: 100%;
}

body {
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  background: var(--bg-gradient);
  color: var(--text);
  min-height: 100svh;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}

button {
  cursor: pointer;
  font-family: inherit;
  border: none;
  background: none;
}

input {
  font-family: inherit;
}
```

- [ ] **Step 4: Create src/App.jsx**

```jsx
// src/App.jsx
import { useReducer, useEffect } from 'react'
import { gameReducer, initialState, buildCards } from './gameReducer'
import { useGameTimer } from './hooks/useGameTimer'
import { useSound } from './hooks/useSound'
import { useFullscreen } from './hooks/useFullscreen'
import { saveGame, loadGame, clearGame, saveHighScore } from './utils/storage'
import { photos } from './photos.config'
import HomeScreen from './components/HomeScreen/HomeScreen'
import TwoPlayerSetup from './components/TwoPlayerSetup/TwoPlayerSetup'
import DifficultyScreen from './components/DifficultyScreen/DifficultyScreen'
import PeekScreen from './components/PeekScreen/PeekScreen'
import GameBoard from './components/GameBoard/GameBoard'
import WinScreen from './components/WinScreen/WinScreen'

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, initialState)
  const { play } = useSound(state.isMuted)
  const { isFullscreen, toggle: toggleFullscreen } = useFullscreen()

  // Timer
  useGameTimer(state.screen, state.isPaused, dispatch)

  // Auto-save on every move during a game
  useEffect(() => {
    if (state.screen === 'game') saveGame(state)
    if (state.screen === 'win') { clearGame(); saveHighScore(state.difficulty, { moves: state.moves, seconds: state.elapsedSeconds }) }
  }, [state])

  const props = { state, dispatch, play, isFullscreen, toggleFullscreen, photos }

  switch (state.screen) {
    case 'home':       return <HomeScreen {...props} />
    case 'setup':      return <TwoPlayerSetup {...props} />
    case 'difficulty': return <DifficultyScreen {...props} />
    case 'peek':       return <PeekScreen {...props} />
    case 'game':       return <GameBoard {...props} />
    case 'win':        return <WinScreen {...props} />
    default:           return <HomeScreen {...props} />
  }
}
```

- [ ] **Step 5: Commit**

```bash
git add src/main.jsx src/App.jsx src/index.css index.html
git commit -m "feat: add app shell, global styles, and screen routing"
```

---

## Task 9: Card Component

**Files:**
- Create: `src/components/GameBoard/Card.jsx`
- Create: `src/components/GameBoard/Card.module.css`
- Create: `src/components/GameBoard/Card.test.jsx`

- [ ] **Step 1: Write the failing test**

```jsx
// src/components/GameBoard/Card.test.jsx
import { render, screen, fireEvent } from '@testing-library/react'
import Card from './Card'

const baseCard = {
  id: '1-a', photoId: 1, src: '/photos/photo1.jpg',
  label: 'Beach', isFlipped: false, isMatched: false, borderColor: '#fda4af',
}

describe('Card', () => {
  it('renders a face-down card (back visible, front hidden)', () => {
    render(<Card card={baseCard} onClick={() => {}} />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const onClick = vi.fn()
    render(<Card card={baseCard} onClick={onClick} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledWith('1-a')
  })

  it('does not call onClick when card is matched', () => {
    const onClick = vi.fn()
    render(<Card card={{ ...baseCard, isMatched: true }} onClick={onClick} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('does not call onClick when card is flipped', () => {
    const onClick = vi.fn()
    render(<Card card={{ ...baseCard, isFlipped: true }} onClick={onClick} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run to confirm failure**

```bash
npm run test:run -- src/components/GameBoard/Card.test.jsx
```

Expected: FAIL — `Cannot find module './Card'`

- [ ] **Step 3: Create Card.module.css**

```css
/* src/components/GameBoard/Card.module.css */
.card {
  perspective: 600px;
  cursor: pointer;
  aspect-ratio: 3 / 4;
  border-radius: var(--card-radius);
}

.card.matched {
  cursor: default;
}

.inner {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: var(--card-radius);
}

.card.flipped .inner {
  transform: rotateY(180deg);
}

.face {
  position: absolute;
  inset: 0;
  border-radius: var(--card-radius);
  backface-visibility: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

/* Back face — purple gradient with star pattern */
.back {
  background: linear-gradient(135deg, #c4b5fd 0%, #7c3aed 100%);
  box-shadow: var(--shadow-md);
}

.backPattern {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.2);
  line-height: 1.6;
  letter-spacing: 4px;
  pointer-events: none;
}

/* Front face — photo with coloured border */
.front {
  transform: rotateY(180deg);
  border: 4px solid var(--border-color, #fda4af);
  box-shadow: var(--shadow-md);
}

.photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: calc(var(--card-radius) - 4px);
  display: block;
}

.photoFallback {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #fce7f3, #eff6ff);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  color: var(--text-muted);
  text-align: center;
  padding: 8px;
  border-radius: calc(var(--card-radius) - 4px);
}

/* Pulse & Scale match animation */
@keyframes pulseMatch {
  0%   { transform: rotateY(180deg) scale(1); box-shadow: var(--shadow-md); }
  40%  { transform: rotateY(180deg) scale(1.12); box-shadow: 0 0 0 6px rgba(167, 139, 250, 0.4), var(--shadow-lg); }
  100% { transform: rotateY(180deg) scale(1); box-shadow: var(--shadow-md); }
}

.card.matched .inner {
  animation: pulseMatch 0.8s cubic-bezier(0.4, 0, 0.2, 1) both;
}
```

- [ ] **Step 4: Create Card.jsx**

```jsx
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
```

- [ ] **Step 5: Run the test to confirm it passes**

```bash
npm run test:run -- src/components/GameBoard/Card.test.jsx
```

Expected: PASS — 4 tests

- [ ] **Step 6: Commit**

```bash
git add src/components/GameBoard/Card.jsx src/components/GameBoard/Card.module.css src/components/GameBoard/Card.test.jsx
git commit -m "feat: add Card component with 3D flip and pulse match animation"
```

---

## Task 10: ProgressBar, HUD, PauseMenu, CardGrid

**Files:**
- Create: `src/components/GameBoard/ProgressBar.jsx`
- Create: `src/components/GameBoard/ProgressBar.module.css`
- Create: `src/components/GameBoard/HUD.jsx`
- Create: `src/components/GameBoard/HUD.module.css`
- Create: `src/components/GameBoard/PauseMenu.jsx`
- Create: `src/components/GameBoard/PauseMenu.module.css`
- Create: `src/components/GameBoard/CardGrid.jsx`
- Create: `src/components/GameBoard/CardGrid.module.css`

- [ ] **Step 1: Create ProgressBar.module.css**

```css
/* src/components/GameBoard/ProgressBar.module.css */
.wrap { width: 100%; padding: 0 4px; }

.track {
  height: 8px;
  background: #e9d5ff;
  border-radius: 50px;
  overflow: hidden;
}

.fill {
  height: 100%;
  background: linear-gradient(90deg, #a78bfa, #ec4899);
  border-radius: 50px;
  transition: width 0.4s ease;
}
```

- [ ] **Step 2: Create ProgressBar.jsx**

```jsx
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
```

- [ ] **Step 3: Create HUD.module.css**

```css
/* src/components/GameBoard/HUD.module.css */
.hud {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: white;
  border-radius: 16px;
  padding: 10px 16px;
  box-shadow: var(--shadow-sm);
  gap: 8px;
  flex-wrap: wrap;
}

.stat {
  text-align: center;
  min-width: 44px;
}

.val {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--purple);
  line-height: 1;
}

.lbl {
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--text-muted);
  margin-top: 2px;
}

.actions {
  display: flex;
  gap: 6px;
  align-items: center;
}

.hintBtn {
  background: linear-gradient(135deg, #fce7f3, #ede9fe);
  border: 1.5px solid var(--pink-light);
  border-radius: 50px;
  padding: 6px 12px;
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--pink);
  transition: opacity 0.2s;
}

.hintBtn:disabled { opacity: 0.4; cursor: not-allowed; }

.iconBtn {
  background: white;
  border: 1.5px solid #e9d5ff;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
}

.iconBtn:hover { background: #fdf4ff; }

@media (max-width: 400px) {
  .val { font-size: 0.95rem; }
  .hintBtn { padding: 5px 10px; font-size: 0.72rem; }
}
```

- [ ] **Step 4: Create HUD.jsx**

```jsx
// src/components/GameBoard/HUD.jsx
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

  function handleHint() {
    const pair = findHintPair(state.cards)
    if (!pair) return
    play('match')
    dispatch({ type: 'USE_HINT', ids: pair })
    setTimeout(() => dispatch({ type: 'HINT_DONE', ids: pair }), 1500)
  }

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
          {isFullscreen ? '⛶' : '⛶'}
        </button>
        <button className={styles.iconBtn} onClick={() => dispatch({ type: 'PAUSE' })} title="Pause">
          ⏸
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Create PauseMenu.module.css**

```css
/* src/components/GameBoard/PauseMenu.module.css */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.box {
  background: white;
  border-radius: 24px;
  padding: 40px 32px;
  box-shadow: var(--shadow-lg);
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 240px;
}

.title { font-size: 1.5rem; font-weight: 800; color: var(--purple); }

.btn {
  border-radius: 50px;
  padding: 12px 24px;
  font-size: 0.95rem;
  font-weight: 700;
  width: 100%;
}

.btnPrimary {
  background: linear-gradient(135deg, var(--purple-light), var(--pink));
  color: white;
  box-shadow: 0 4px 14px rgba(167, 139, 250, 0.4);
}

.btnSecondary {
  background: white;
  border: 2px solid #e9d5ff;
  color: var(--purple);
}
```

- [ ] **Step 6: Create PauseMenu.jsx**

```jsx
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
```

- [ ] **Step 7: Create CardGrid.module.css**

```css
/* src/components/GameBoard/CardGrid.module.css */
.grid {
  display: grid;
  gap: 8px;
  width: 100%;
}

/* Easy: 4 cols */
.cols4 { grid-template-columns: repeat(4, 1fr); }
/* Medium: 4 cols × 6 rows  */
.cols4 { grid-template-columns: repeat(4, 1fr); }
/* Hard: 6 cols */
.cols6 { grid-template-columns: repeat(6, 1fr); }

@media (max-width: 480px) {
  .cols6 { gap: 5px; }
}
```

- [ ] **Step 8: Create CardGrid.jsx**

```jsx
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
```

- [ ] **Step 9: Commit**

```bash
git add src/components/GameBoard/
git commit -m "feat: add ProgressBar, HUD, PauseMenu, and CardGrid components"
```

---

## Task 11: GameBoard Screen

**Files:**
- Create: `src/components/GameBoard/GameBoard.jsx`
- Create: `src/components/GameBoard/GameBoard.module.css`

- [ ] **Step 1: Create GameBoard.module.css**

```css
/* src/components/GameBoard/GameBoard.module.css */
.board {
  min-height: 100svh;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 700px;
  margin: 0 auto;
}

/* 2-player score tabs */
.playerTabs {
  display: flex;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.playerTab {
  flex: 1;
  padding: 8px 12px;
  text-align: center;
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--text-muted);
  transition: background 0.2s, color 0.2s;
}

.playerTab.active {
  background: linear-gradient(135deg, var(--purple-light), var(--pink));
  color: white;
}
```

- [ ] **Step 2: Create GameBoard.jsx**

```jsx
// src/components/GameBoard/GameBoard.jsx
import { useEffect } from 'react'
import { saveGame } from '../../utils/storage'
import HUD from './HUD'
import ProgressBar from './ProgressBar'
import CardGrid from './CardGrid'
import PauseMenu from './PauseMenu'
import styles from './GameBoard.module.css'

export default function GameBoard({ state, dispatch, play, isFullscreen, toggleFullscreen }) {
  const { cards, difficulty, flippedIds, isEvaluating, isPaused, pairsFound, totalPairs, players, activePlayer } = state

  // Auto-save
  useEffect(() => { saveGame(state) }, [state])

  // Resolve non-matching pair after 1 second
  useEffect(() => {
    if (!isEvaluating || flippedIds.length !== 2) return
    const [id1, id2] = flippedIds
    const c1 = cards.find(c => c.id === id1)
    const c2 = cards.find(c => c.id === id2)
    if (c1 && c2 && c1.photoId !== c2.photoId) {
      play('noMatch')
      const timer = setTimeout(() => dispatch({ type: 'RESOLVE_FLIP' }), 1000)
      return () => clearTimeout(timer)
    }
  }, [isEvaluating, flippedIds])

  function handleCardClick(id) {
    play('flip')
    dispatch({ type: 'FLIP_CARD', id })
  }

  // Play match sound when pairsFound increases
  const prevPairs = useRef(0)
  useEffect(() => {
    if (pairsFound > prevPairs.current) play('match')
    prevPairs.current = pairsFound
  }, [pairsFound])

  const is2P = players.length > 1

  return (
    <div className={styles.board}>
      {is2P && (
        <div className={styles.playerTabs}>
          {players.map((p, i) => (
            <div key={i} className={`${styles.playerTab} ${i === activePlayer ? styles.active : ''}`}>
              {p.name} — {p.score}
            </div>
          ))}
        </div>
      )}
      <HUD state={state} dispatch={dispatch} play={play} isFullscreen={isFullscreen} toggleFullscreen={toggleFullscreen} />
      <ProgressBar pairsFound={pairsFound} totalPairs={totalPairs} />
      <CardGrid cards={cards} difficulty={difficulty} onCardClick={handleCardClick} />
      {isPaused && <PauseMenu dispatch={dispatch} />}
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/GameBoard/GameBoard.jsx src/components/GameBoard/GameBoard.module.css
git commit -m "feat: add GameBoard screen with auto-save, sounds, and pause menu"
```

---

## Task 12: HomeScreen

**Files:**
- Create: `src/components/HomeScreen/HomeScreen.jsx`
- Create: `src/components/HomeScreen/HomeScreen.module.css`

- [ ] **Step 1: Create HomeScreen.module.css**

```css
/* src/components/HomeScreen/HomeScreen.module.css */
.screen {
  min-height: 100svh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  gap: 16px;
  text-align: center;
}

.emoji { font-size: 3.5rem; }

.title {
  font-size: 2.2rem;
  font-weight: 900;
  color: var(--purple);
  letter-spacing: -1px;
}

.subtitle {
  font-size: 0.9rem;
  color: var(--text-muted);
  margin-top: -8px;
}

.cardPreview {
  display: flex;
  gap: 10px;
  margin: 8px 0;
}

.miniCard {
  width: 48px;
  height: 64px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  box-shadow: var(--shadow-sm);
}

.miniBack {
  background: linear-gradient(135deg, #c4b5fd, #7c3aed);
  font-size: 0.9rem;
  color: rgba(255,255,255,0.4);
}

.btnPrimary {
  background: linear-gradient(135deg, var(--purple-light), var(--pink));
  color: white;
  border-radius: 50px;
  padding: 14px 32px;
  font-size: 1rem;
  font-weight: 700;
  width: 100%;
  max-width: 280px;
  box-shadow: 0 4px 16px rgba(167, 139, 250, 0.4);
  transition: transform 0.15s, box-shadow 0.15s;
}

.btnPrimary:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(167, 139, 250, 0.5); }
.btnPrimary:active { transform: translateY(0); }

.btnSecondary {
  background: white;
  color: var(--purple);
  border: 2px solid #e9d5ff;
  border-radius: 50px;
  padding: 12px 32px;
  font-size: 0.95rem;
  font-weight: 600;
  width: 100%;
  max-width: 280px;
  transition: background 0.15s;
}

.btnSecondary:hover { background: #fdf4ff; }

.bestScore {
  font-size: 0.78rem;
  color: var(--purple-light);
  margin-top: 4px;
}

.resumeBox {
  background: white;
  border: 2px solid #e9d5ff;
  border-radius: 16px;
  padding: 14px 20px;
  width: 100%;
  max-width: 280px;
  text-align: left;
}

.resumeTitle { font-size: 0.85rem; font-weight: 700; color: var(--purple); }
.resumeSub { font-size: 0.75rem; color: var(--text-muted); }
.resumeActions { display: flex; gap: 8px; margin-top: 10px; }
.resumeActions button { flex: 1; border-radius: 50px; padding: 8px; font-size: 0.8rem; font-weight: 600; }
.resumeYes { background: var(--purple-light); color: white; }
.resumeNo  { background: white; border: 1.5px solid #e9d5ff; color: var(--purple); }
```

- [ ] **Step 2: Create HomeScreen.jsx**

```jsx
// src/components/HomeScreen/HomeScreen.jsx
import { useEffect, useState } from 'react'
import { loadGame, clearGame, loadHighScore } from '../../utils/storage'
import styles from './HomeScreen.module.css'

function formatTime(s) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

export default function HomeScreen({ dispatch }) {
  const [savedGame, setSavedGame] = useState(null)
  const [bestEasy, setBestEasy] = useState(null)

  useEffect(() => {
    setSavedGame(loadGame())
    setBestEasy(loadHighScore('easy'))
  }, [])

  function resumeGame() {
    if (savedGame) dispatch({ type: 'RESTORE', state: savedGame })
  }

  function dismissResume() {
    clearGame()
    setSavedGame(null)
  }

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

      {bestEasy && (
        <p className={styles.bestScore}>
          🏆 Best (Easy): {bestEasy.moves} moves · {formatTime(bestEasy.seconds)}
        </p>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Add RESTORE action to gameReducer.js**

Open `src/gameReducer.js` and add this case before `default`:

```js
    case 'RESTORE':
      return { ...action.state }
```

- [ ] **Step 4: Commit**

```bash
git add src/components/HomeScreen/ src/gameReducer.js
git commit -m "feat: add HomeScreen with resume prompt and best score"
```

---

## Task 13: TwoPlayerSetup and DifficultyScreen

**Files:**
- Create: `src/components/TwoPlayerSetup/TwoPlayerSetup.jsx`
- Create: `src/components/TwoPlayerSetup/TwoPlayerSetup.module.css`
- Create: `src/components/DifficultyScreen/DifficultyScreen.jsx`
- Create: `src/components/DifficultyScreen/DifficultyScreen.module.css`

- [ ] **Step 1: Create TwoPlayerSetup.module.css**

```css
/* src/components/TwoPlayerSetup/TwoPlayerSetup.module.css */
.screen {
  min-height: 100svh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 24px;
  gap: 20px;
  text-align: center;
}

.title { font-size: 1.6rem; font-weight: 800; color: var(--purple); }
.subtitle { font-size: 0.88rem; color: var(--text-muted); }

.form { display: flex; flex-direction: column; gap: 12px; width: 100%; max-width: 280px; }

.input {
  border: 2px solid #e9d5ff;
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s;
  width: 100%;
  background: white;
  color: var(--text);
}

.input:focus { border-color: var(--purple-light); }

.btnPrimary {
  background: linear-gradient(135deg, var(--purple-light), var(--pink));
  color: white;
  border-radius: 50px;
  padding: 14px;
  font-size: 1rem;
  font-weight: 700;
  box-shadow: 0 4px 16px rgba(167, 139, 250, 0.4);
}

.btnPrimary:disabled { opacity: 0.5; cursor: not-allowed; }

.btnBack {
  background: none;
  color: var(--text-muted);
  font-size: 0.85rem;
  text-decoration: underline;
}
```

- [ ] **Step 2: Create TwoPlayerSetup.jsx**

```jsx
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
```

- [ ] **Step 3: Add SET_PLAYERS action to gameReducer.js**

Add before `default`:

```js
    case 'SET_PLAYERS':
      return { ...state, players: action.players }
```

- [ ] **Step 4: Create DifficultyScreen.module.css**

```css
/* src/components/DifficultyScreen/DifficultyScreen.module.css */
.screen {
  min-height: 100svh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 24px;
  gap: 16px;
}

.title { font-size: 1.6rem; font-weight: 800; color: var(--purple); text-align: center; }
.subtitle { font-size: 0.88rem; color: var(--text-muted); text-align: center; }

.options { display: flex; flex-direction: column; gap: 12px; width: 100%; max-width: 320px; }

.option {
  background: white;
  border: 2px solid #e9d5ff;
  border-radius: 16px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: border-color 0.15s, transform 0.15s;
  text-align: left;
  box-shadow: var(--shadow-sm);
}

.option:hover { border-color: var(--purple-light); transform: translateY(-2px); }

.optionLeft { display: flex; flex-direction: column; gap: 2px; }
.optionName { font-size: 0.95rem; font-weight: 700; color: var(--text); }
.optionSub  { font-size: 0.75rem; color: var(--text-muted); }

.badge {
  background: #ede9fe;
  color: var(--purple);
  border-radius: 50px;
  padding: 4px 12px;
  font-size: 0.72rem;
  font-weight: 700;
}

.btnBack {
  background: none;
  color: var(--text-muted);
  font-size: 0.85rem;
  text-decoration: underline;
  margin-top: 4px;
}
```

- [ ] **Step 5: Create DifficultyScreen.jsx**

```jsx
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
```

- [ ] **Step 6: Commit**

```bash
git add src/components/TwoPlayerSetup/ src/components/DifficultyScreen/ src/gameReducer.js
git commit -m "feat: add TwoPlayerSetup and DifficultyScreen"
```

---

## Task 14: PeekScreen

**Files:**
- Create: `src/components/PeekScreen/PeekScreen.jsx`
- Create: `src/components/PeekScreen/PeekScreen.module.css`

- [ ] **Step 1: Create PeekScreen.module.css**

```css
/* src/components/PeekScreen/PeekScreen.module.css */
.screen {
  min-height: 100svh;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  max-width: 700px;
  margin: 0 auto;
}

.header { text-align: center; padding-top: 8px; }
.label { font-size: 1rem; font-weight: 700; color: var(--purple); }
.sub   { font-size: 0.8rem; color: var(--text-muted); }

.countdown {
  font-size: 4rem;
  font-weight: 900;
  color: var(--purple-light);
  line-height: 1;
  animation: pulse 1s ease infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.08); }
}
```

- [ ] **Step 2: Create PeekScreen.jsx**

```jsx
// src/components/PeekScreen/PeekScreen.jsx
import { useEffect, useState } from 'react'
import { DIFFICULTY_CONFIG } from '../../constants'
import CardGrid from '../GameBoard/CardGrid'
import styles from './PeekScreen.module.css'

export default function PeekScreen({ state, dispatch }) {
  const { difficulty, cards } = state
  const { peekSeconds } = DIFFICULTY_CONFIG[difficulty]
  const [count, setCount] = useState(peekSeconds)

  useEffect(() => {
    if (count <= 0) { dispatch({ type: 'PEEK_DONE' }); return }
    const timer = setTimeout(() => setCount(c => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [count])

  return (
    <div className={styles.screen}>
      <div className={styles.header}>
        <div className={styles.label}>👀 Memorise the cards!</div>
        <div className={styles.sub}>Game starts in…</div>
      </div>
      <div className={styles.countdown}>{count}</div>
      <CardGrid cards={cards} difficulty={difficulty} onCardClick={() => {}} />
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/PeekScreen/
git commit -m "feat: add PeekScreen with countdown"
```

---

## Task 15: WinScreen

**Files:**
- Create: `src/components/WinScreen/WinScreen.jsx`
- Create: `src/components/WinScreen/WinScreen.module.css`

- [ ] **Step 1: Create WinScreen.module.css**

```css
/* src/components/WinScreen/WinScreen.module.css */
.screen {
  min-height: 100svh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 24px;
  gap: 16px;
  text-align: center;
}

.trophy { font-size: 4rem; }
.title  { font-size: 2rem; font-weight: 900; color: var(--purple); }
.sub    { font-size: 0.9rem; color: var(--text-muted); }

.stars { font-size: 2rem; letter-spacing: 6px; }

.stats {
  display: flex;
  gap: 12px;
  justify-content: center;
  width: 100%;
  max-width: 320px;
}

.stat {
  background: white;
  border-radius: 16px;
  padding: 14px;
  flex: 1;
  box-shadow: var(--shadow-sm);
}

.statVal { font-size: 1.3rem; font-weight: 800; color: var(--purple); }
.statLbl { font-size: 0.62rem; text-transform: uppercase; letter-spacing: 1px; color: var(--text-muted); }

/* 2-player winner */
.scores {
  display: flex;
  gap: 10px;
  max-width: 320px;
  width: 100%;
}

.scoreBox {
  background: white;
  border-radius: 16px;
  padding: 14px;
  flex: 1;
  box-shadow: var(--shadow-sm);
  border: 2px solid transparent;
}

.scoreBox.winner { border-color: var(--purple-light); }
.scoreName { font-size: 0.85rem; font-weight: 700; color: var(--text); }
.scoreVal  { font-size: 1.4rem; font-weight: 900; color: var(--purple); }
.scoreLbl  { font-size: 0.62rem; text-transform: uppercase; color: var(--text-muted); }

.btnPrimary {
  background: linear-gradient(135deg, var(--purple-light), var(--pink));
  color: white;
  border-radius: 50px;
  padding: 14px 32px;
  font-size: 1rem;
  font-weight: 700;
  width: 100%;
  max-width: 280px;
  box-shadow: 0 4px 16px rgba(167, 139, 250, 0.4);
}

.btnSecondary {
  background: white;
  color: var(--purple);
  border: 2px solid #e9d5ff;
  border-radius: 50px;
  padding: 12px 32px;
  font-size: 0.95rem;
  font-weight: 600;
  width: 100%;
  max-width: 280px;
}
```

- [ ] **Step 2: Create WinScreen.jsx**

```jsx
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
```

- [ ] **Step 3: Commit**

```bash
git add src/components/WinScreen/
git commit -m "feat: add WinScreen with confetti, star rating, and 2-player support"
```

---

## Task 16: Wire Up and Smoke Test

**Files:**
- Modify: `src/App.jsx` (add resume support)

- [ ] **Step 1: Verify the app compiles**

```bash
npm run dev
```

Expected: Vite dev server starts with no errors. Open http://localhost:5173

- [ ] **Step 2: Add placeholder photos so the game can start**

Create 18 placeholder image files so the game doesn't show broken images. Run:

```bash
for i in $(seq -w 01 18); do
  curl -s "https://picsum.photos/seed/$i/300/400" -o "public/photos/photo${i}.jpg"
done
```

(This downloads free placeholder photos. Replace them with your real photos later.)

- [ ] **Step 3: Manual smoke test — solo game**

1. Open http://localhost:5173
2. Click **Play Solo**
3. Select **Easy**
4. Watch the 3-second peek countdown
5. Flip two matching cards — they should stay face-up with a pulse animation
6. Flip two non-matching cards — they should flip back after 1 second
7. Click **💡 Hint** — an unmatched pair should briefly appear
8. Find all 8 pairs — the win screen should appear with confetti

- [ ] **Step 4: Manual smoke test — 2-player game**

1. Click **2 Players**, enter two names
2. Select **Easy**
3. Verify player tabs show at the top of the board
4. Match a pair — the same player should get another turn
5. Miss a pair — the other player should take over
6. Complete the game — the win screen shows scores and the winner

- [ ] **Step 5: Manual smoke test — mobile**

Open Chrome DevTools → toggle device toolbar → select iPhone 14 Pro. Verify:
- Cards are large enough to tap
- HUD doesn't overflow
- Board fills the screen width

- [ ] **Step 6: Run all unit tests**

```bash
npm run test:run
```

Expected: All tests PASS (shuffle, storage, starRating, gameReducer, Card)

- [ ] **Step 7: Commit**

```bash
git add public/photos/
git commit -m "feat: add placeholder photos for development"
```

---

## Task 17: Final Polish — Responsive and Accessibility

**Files:**
- Modify: `src/index.css`
- Modify: `src/components/GameBoard/GameBoard.module.css`

- [ ] **Step 1: Add responsive improvements to index.css**

Append to the end of `src/index.css`:

```css
/* Responsive */
@media (max-width: 480px) {
  :root { --card-radius: 10px; }
}

/* Prevent scroll bounce on iOS */
html { overflow: hidden; height: 100%; }
body { overflow-y: auto; height: 100%; -webkit-overflow-scrolling: touch; }

/* Better tap targets on mobile */
@media (pointer: coarse) {
  button { min-height: 44px; }
}

/* Focus ring for keyboard users */
button:focus-visible {
  outline: 3px solid var(--purple-light);
  outline-offset: 2px;
}
```

- [ ] **Step 2: Ensure 6×6 grid scales on small screens**

Add to `src/components/GameBoard/CardGrid.module.css`:

```css
@media (max-width: 360px) {
  .cols6 { gap: 4px; }
  .cols4 { gap: 5px; }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/index.css src/components/GameBoard/CardGrid.module.css
git commit -m "feat: add responsive polish and accessibility improvements"
```

---

## Task 18: Add Your Real Photos

**Files:**
- Modify: `public/photos/` (replace placeholders)
- Modify: `src/photos.config.js` (update entries)

- [ ] **Step 1: Copy your photos into public/photos/**

Rename your photos to match the config (e.g. `photo01.jpg`, `photo02.jpg`, …) or use any filenames and update the config.

For best results:
- Square or portrait aspect ratio (3:4 works best for the card shape)
- At least 300×400px resolution
- JPG or PNG format

- [ ] **Step 2: Update src/photos.config.js with your real labels**

```js
export const photos = [
  { id: 1,  src: '/photos/beach-2023.jpg',   label: 'Beach 2023'   },
  { id: 2,  src: '/photos/birthday.jpg',     label: 'Birthday'     },
  // ... update all 18 entries with your filenames and labels
]
```

- [ ] **Step 3: Verify photos load**

Open http://localhost:5173, start a game, and confirm all photo cards display correctly.

- [ ] **Step 4: Commit**

```bash
git add public/photos/ src/photos.config.js
git commit -m "feat: add personal photos to the game"
```

---

## Checklist — Spec Coverage

| Spec requirement | Covered in task |
|---|---|
| Soft pastel visual style | Task 8 (index.css) |
| Purple gradient card back with stars | Task 9 (Card.module.css) |
| Card face: rounded coloured border | Task 9 (Card.jsx, Card.module.css) |
| Smooth 3D flip animation | Task 9 (Card.module.css) |
| Pulse & scale match animation | Task 9 (Card.module.css) |
| Win celebration confetti | Task 15 (WinScreen) |
| Timer (count up / countdown) | Task 7 (useGameTimer), Task 10 (HUD) |
| Move counter | Task 6 (reducer), Task 10 (HUD) |
| High score saved to localStorage | Task 4 (storage), Task 8 (App.jsx) |
| Sound effects (mutable) | Task 7 (useSound), Task 10 (HUD toggle) |
| Grid size options (3 difficulties) | Task 2 (constants), Task 13 (DifficultyScreen) |
| 2-player hot-seat | Task 6 (reducer), Task 13 (TwoPlayerSetup), Task 11 (GameBoard), Task 15 (WinScreen) |
| Custom photo cards | Task 2 (photos.config.js), Task 9 (Card.jsx) |
| Card peek at start | Task 14 (PeekScreen) |
| Hint system (+2 moves) | Task 6 (reducer), Task 10 (HUD) |
| Match animation | Task 9 (Card.module.css) |
| Progress bar | Task 10 (ProgressBar) |
| Auto-save / resume | Task 4 (storage), Task 11 (GameBoard), Task 12 (HomeScreen) |
| Fullscreen mode | Task 7 (useFullscreen), Task 10 (HUD) |
| Responsive layout | Task 10 (CardGrid.module.css), Task 17 |
| Star rating on win screen | Task 5 (starRating), Task 15 (WinScreen) |
| Pause menu | Task 10 (PauseMenu) |
