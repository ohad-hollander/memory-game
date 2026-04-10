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
