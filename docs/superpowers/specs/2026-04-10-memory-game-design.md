# Memory Game — Design Spec
**Date:** 2026-04-10
**Status:** Approved

---

## Overview

A beautiful, responsive memory card game built as a web app. Players flip cards to find matching pairs using custom family photos uploaded by the developer. Designed for family and friends of all ages, playable on desktop and mobile Chrome.

---

## Visual Design

**Style:** Soft pastel — warm gradient backgrounds (pink → purple → blue), rounded corners, soft shadows, white space.

**Card back:** Purple gradient (violet → indigo) with a subtle star pattern (✦). Rich and premium-feeling.

**Card face:** Full-bleed photo with a thick rounded coloured border. Each pair is assigned a unique colour from a predefined pastel palette (pink, mint, blue, yellow, lavender, peach…) at game initialisation — consistent within a session, reshuffled on new game.

**Card flip animation:** Smooth 3D flip (`rotateY`) with `perspective: 600px` and `cubic-bezier(0.4, 0, 0.2, 1)` easing. Classic and polished.

**Match animation:** Pulse & Scale — matched cards swell to 112% with a purple glow shadow, then settle back. Duration ~0.8s.

**Win celebration:** Full-screen confetti burst via `canvas-confetti`.

---

## Tech Stack

| Concern | Choice | Reason |
|---|---|---|
| Framework | React + Vite | Component model fits game architecture; fast HMR |
| Styles | CSS Modules | Scoped per component, no class collisions |
| Audio | Howler.js | Best mobile browser compatibility for web audio |
| Confetti | canvas-confetti | One-line win celebration, zero dependencies |
| State | useState + useReducer | Sufficient for game state; no Redux needed |
| Persistence | localStorage | No backend required; scores and auto-save work offline |

---

## Photo System

Photos are baked in by the developer — no player upload UI needed.

**File location:** `public/photos/` (inside the project root)

**Config file:** `src/photos.config.js`
```js
export const photos = [
  { id: 1, src: '/photos/beach.jpg',    label: 'Beach 2023' },
  { id: 2, src: '/photos/birthday.jpg', label: 'Birthday'   },
  // add more here
]
```

To add photos: drop the file in `public/photos/`, add one line to the config.

---

## Screen Flow

```
Home Screen
├── Play Solo → Difficulty Select → Card Peek → Game Board → Win Screen
└── 2 Players → Enter Names → Difficulty Select → Card Peek → Game Board → Win Screen
```

### Screens

1. **Home** — title, Play Solo button, 2 Players button, personal best (moves + time)
2. **Two-Player Setup** — two text inputs for player names
3. **Difficulty Select** — Easy / Medium / Hard cards with grid size and timer info
4. **Card Peek** — countdown (3/2/1s depending on difficulty), all cards face-up
5. **Game Board** — HUD + card grid + progress bar
6. **Pause Menu** — overlay with Resume / Restart / Quit
7. **Win Screen** — confetti, stats (time, moves, star rating), Play Again / Change Difficulty

---

## Difficulty Levels

| | Easy | Medium | Hard |
|---|---|---|---|
| Grid | 4×4 (8 pairs) | 4×6 (12 pairs) | 6×6 (18 pairs) |
| Timer | Count up | Count up | Countdown — 3 minutes |
| Peek duration | 3 seconds | 2 seconds | 1 second |
| Hint penalty | +2 moves | +2 moves | +2 moves |

---

## Game Board — HUD

Top bar contains (left to right):
- ⏱ **Timer** — counts up (Easy/Medium) or down (Hard)
- 🔢 **Moves** — increments every time two cards are flipped
- 🃏 **Pairs** — e.g. `3 / 8`
- 💡 **Hint** button — briefly highlights an unmatched pair for 1.5s, costs +2 moves

Below HUD: **progress bar** filling left to right as pairs are found.

---

## Game Mechanics

- Cards are shuffled randomly (Fisher-Yates) at the start of each game
- Player may flip up to 2 cards per turn
- If they match: pulse & scale animation plays, cards stay face-up, player scores a pair
- If they don't match: cards flip back after 1 second (no double-flip allowed during delay)
- Hint: reveals a random unmatched pair for 1.5s, adds +2 to move counter
- **Auto-save:** full game state written to `localStorage` on every move; on page load the game offers to resume

---

## 2-Player Mode (Hot-Seat)

- Players enter their names on the setup screen
- Take turns flipping cards on the same device
- If a player finds a match, they get a point and take another turn
- Active player shown in a tab at the top of the board
- Win screen shows both scores and declares the winner
- **Online multiplayer:** out of scope for v1, designed to be added later

---

## Features Checklist

- [x] Timer (count up / countdown)
- [x] Move counter
- [x] High score saved to localStorage (best time + best moves per difficulty)
- [x] Win celebration (canvas-confetti)
- [x] Sound effects — flip, match chime, wrong-match thud, win fanfare (all toggleable via mute button)
- [x] Grid size options — 3 difficulty levels
- [x] 2-player hot-seat mode
- [x] Custom photo cards (baked in by developer)
- [x] Card peek at game start
- [x] Hint system (+2 move penalty)
- [x] Match animation (pulse & scale)
- [x] Progress bar
- [x] Auto-save / resume
- [x] Fullscreen mode (browser Fullscreen API)
- [ ] Online multiplayer (v2)

---

## Responsive Layout

- **Mobile (< 640px):** 4×4 grid fills screen width; cards are large tap targets; HUD stacks cleanly
- **Desktop (≥ 640px):** board centered with max-width; larger cards; 6×6 grid comfortable on screen
- Layout uses CSS Grid with `auto-fit` columns sized by difficulty

---

## Component Architecture

```
App
├── HomeScreen
├── TwoPlayerSetup
├── DifficultyScreen
├── PeekScreen
├── GameBoard
│   ├── HUD
│   ├── ProgressBar
│   ├── CardGrid
│   │   └── Card
│   └── PauseMenu
└── WinScreen
```

**State:** managed with `useReducer` at the `App` level. Actions: `START_GAME`, `FLIP_CARD`, `CHECK_MATCH`, `USE_HINT`, `PAUSE`, `RESUME`, `RESTART`, `QUIT`, `WIN`.

---

## Data Model

```js
// Game state shape
{
  screen: 'home' | 'setup' | 'difficulty' | 'peek' | 'game' | 'win',
  difficulty: 'easy' | 'medium' | 'hard',
  players: [{ name: string, score: number }],
  activePlayer: 0 | 1,
  cards: [{ id, photoId, isFlipped, isMatched, borderColor }],
  flippedIds: [],          // 0, 1, or 2 card IDs currently face-up and unmatched
  moves: number,
  elapsedSeconds: number,
  hintsUsed: number,
  pairsFound: number,
  totalPairs: number,
}
```

---

## Audio

All sounds sourced from a free library (e.g. Freesound.org) or generated with a tone generator.

| Event | Sound |
|---|---|
| Card flip | Soft paper/card whoosh |
| Match found | Short chime / ding |
| No match | Soft thud / low tone |
| Win | Short fanfare or cheerful jingle |

Global mute toggle in the top-right corner of every screen.

---

## Out of Scope (v1)

- Online multiplayer
- User accounts / cloud scores
- Multiple photo albums / album picker
- Animations beyond what is specified
