// src/hooks/useSound.js
// Generates sounds via Web Audio API — no audio files needed

function createAudioContext() {
  try {
    return new (window.AudioContext || window.webkitAudioContext)()
  } catch (_) {
    return null
  }
}

function playTone(ctx, { freq = 440, freq2, type = 'sine', duration = 0.15, volume = 0.3, delay = 0 } = {}) {
  if (!ctx) return
  const t = ctx.currentTime + delay
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.type = type
  osc.frequency.setValueAtTime(freq, t)
  if (freq2) osc.frequency.linearRampToValueAtTime(freq2, t + duration)
  gain.gain.setValueAtTime(volume, t)
  gain.gain.exponentialRampToValueAtTime(0.001, t + duration)
  osc.start(t)
  osc.stop(t + duration)
}

const SOUNDS = {
  flip() {
    const ctx = createAudioContext()
    playTone(ctx, { freq: 600, freq2: 300, type: 'sine', duration: 0.08, volume: 0.15 })
  },
  match() {
    const ctx = createAudioContext()
    // Two-note chime
    playTone(ctx, { freq: 523, type: 'sine', duration: 0.15, volume: 0.3, delay: 0 })
    playTone(ctx, { freq: 784, type: 'sine', duration: 0.2,  volume: 0.3, delay: 0.12 })
  },
  noMatch() {
    const ctx = createAudioContext()
    playTone(ctx, { freq: 220, freq2: 180, type: 'triangle', duration: 0.18, volume: 0.2 })
  },
  win() {
    const ctx = createAudioContext()
    // Short fanfare: C-E-G-C
    const notes = [262, 330, 392, 523]
    notes.forEach((freq, i) => {
      playTone(ctx, { freq, type: 'sine', duration: 0.18, volume: 0.3, delay: i * 0.14 })
    })
  },
}

export function useSound(isMuted) {
  function play(name) {
    if (isMuted) return
    SOUNDS[name]?.()
  }
  return { play }
}
