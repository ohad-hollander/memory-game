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
