// src/hooks/useGameTimer.js
import { useEffect } from 'react'

export function useGameTimer(screen, isPaused, dispatch) {
  useEffect(() => {
    if (screen !== 'game' || isPaused) return
    const id = setInterval(() => dispatch({ type: 'TICK' }), 1000)
    return () => clearInterval(id)
  }, [screen, isPaused, dispatch])
}
