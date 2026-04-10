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
