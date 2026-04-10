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
