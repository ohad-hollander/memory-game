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

  describe('USE_HINT', () => {
    const getGameState = () => {
      const cards = buildCards(makePhotos(8), 'easy').map(c => ({ ...c, isFlipped: false }))
      return { ...initialState, screen: 'game', cards, totalPairs: 8 }
    }

    it('flips the hinted cards face-up', () => {
      const state = getGameState()
      const hintIds = [state.cards[0].id, state.cards[1].id]
      const next = gameReducer(state, { type: 'USE_HINT', ids: hintIds })
      hintIds.forEach(id => expect(next.cards.find(c => c.id === id).isFlipped).toBe(true))
    })

    it('adds 2 to moves', () => {
      const state = getGameState()
      const hintIds = [state.cards[0].id, state.cards[1].id]
      const next = gameReducer(state, { type: 'USE_HINT', ids: hintIds })
      expect(next.moves).toBe(2)
    })

    it('increments hintsUsed by 1', () => {
      const state = getGameState()
      const hintIds = [state.cards[0].id, state.cards[1].id]
      const next = gameReducer(state, { type: 'USE_HINT', ids: hintIds })
      expect(next.hintsUsed).toBe(1)
    })

    it('sets isEvaluating to true', () => {
      const state = getGameState()
      const hintIds = [state.cards[0].id, state.cards[1].id]
      const next = gameReducer(state, { type: 'USE_HINT', ids: hintIds })
      expect(next.isEvaluating).toBe(true)
    })
  })

  describe('HINT_DONE', () => {
    const getHintState = () => {
      const cards = buildCards(makePhotos(8), 'easy').map(c => ({ ...c, isFlipped: false }))
      const hintIds = [cards[0].id, cards[1].id]
      return {
        state: { ...initialState, screen: 'game', cards, totalPairs: 8, isEvaluating: true },
        hintIds,
      }
    }

    it('flips non-matched hinted cards back face-down', () => {
      const { state, hintIds } = getHintState()
      const withFlipped = {
        ...state,
        cards: state.cards.map(c => hintIds.includes(c.id) ? { ...c, isFlipped: true } : c),
      }
      const next = gameReducer(withFlipped, { type: 'HINT_DONE', ids: hintIds })
      hintIds.forEach(id => expect(next.cards.find(c => c.id === id).isFlipped).toBe(false))
    })

    it('leaves matched cards face-up even if in ids', () => {
      const { state, hintIds } = getHintState()
      const withMatchedFlipped = {
        ...state,
        cards: state.cards.map(c =>
          hintIds.includes(c.id) ? { ...c, isFlipped: true, isMatched: true } : c
        ),
      }
      const next = gameReducer(withMatchedFlipped, { type: 'HINT_DONE', ids: hintIds })
      hintIds.forEach(id => expect(next.cards.find(c => c.id === id).isFlipped).toBe(true))
    })

    it('sets isEvaluating to false', () => {
      const { state, hintIds } = getHintState()
      const next = gameReducer(state, { type: 'HINT_DONE', ids: hintIds })
      expect(next.isEvaluating).toBe(false)
    })
  })

  describe('TOGGLE_MUTE', () => {
    it('toggles isMuted', () => {
      expect(gameReducer(initialState, { type: 'TOGGLE_MUTE' }).isMuted).toBe(true)
      expect(gameReducer({ ...initialState, isMuted: true }, { type: 'TOGGLE_MUTE' }).isMuted).toBe(false)
    })
  })
})
