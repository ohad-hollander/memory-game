// src/gameReducer.js
import { shuffle } from './utils/shuffle'
import { DIFFICULTY_CONFIG, BORDER_COLORS } from './constants'

export const initialState = {
  screen: 'home',
  difficulty: 'easy',
  players: [{ name: '', score: 0 }],
  activePlayer: 0,
  cards: [],
  flippedIds: [],
  isEvaluating: false,
  moves: 0,
  elapsedSeconds: 0,
  hintsUsed: 0,
  pairsFound: 0,
  totalPairs: 0,
  isPaused: false,
  isMuted: false,
}

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
        isMuted: state.isMuted,
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
      const { ids } = action
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

    case 'SET_PLAYERS':
      return { ...state, players: action.players }

    case 'RESTORE':
      return { ...action.state }

    default:
      return state
  }
}
