export interface BracketMatch { round: number; slot: number; teamA: string | null; teamB: string | null }

/** Single elimination: pads to next power of two with byes (null). Seeds 1 v last, 2 v second-last... */
export function generateSingleElimination(seededTeamIds: string[]): BracketMatch[] {
  let size = 1
  while (size < seededTeamIds.length) size *= 2
  const seeds: (string | null)[] = [...seededTeamIds, ...Array(size - seededTeamIds.length).fill(null)]
  const matches: BracketMatch[] = []
  for (let i = 0; i < size / 2; i++) {
    matches.push({ round: 1, slot: i + 1, teamA: seeds[i], teamB: seeds[size - 1 - i] })
  }
  let count = size / 4, round = 2
  while (count >= 1) {
    for (let s = 1; s <= count; s++) matches.push({ round, slot: s, teamA: null, teamB: null })
    count /= 2; round++
  }
  return matches
}
