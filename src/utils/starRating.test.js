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
