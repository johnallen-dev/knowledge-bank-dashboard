export type MatchType = 'exact' | 'fts' | 'notion' | 'ai' | 'none'

export function bm25ToConfidence(rank: number): number {
  // BM25 rank is negative; more negative = better match
  // Map [-5, -0.1] to [0.95, 0.50]
  const clamped = Math.max(-5, Math.min(-0.1, rank))
  return 0.50 + ((clamped - (-5)) / ((-0.1) - (-5))) * 0.45
}

export function baseConfidence(matchType: MatchType): number {
  switch (matchType) {
    case 'exact': return 1.0
    case 'fts': return 0.75
    case 'notion': return 0.60
    case 'ai': return 0.40
    case 'none': return 0.10
  }
}

export function blendConfidence(matchScore: number, claudeScore: number | null): number {
  if (claudeScore === null) return matchScore
  return matchScore * 0.7 + claudeScore * 0.3
}

export function confidenceLabel(score: number): 'high' | 'medium' | 'low' {
  if (score >= 0.80) return 'high'
  if (score >= 0.50) return 'medium'
  return 'low'
}
