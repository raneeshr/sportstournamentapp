export interface Pairing { round: number; teamA: string; teamB: string }

/** Circle-method round robin. Handles odd team counts with a bye. */
export function generateRoundRobin(teamIds: string[], doubleRound = false): Pairing[] {
  const teams: (string | null)[] = [...teamIds]
  if (teams.length % 2 === 1) teams.push(null)
  const n = teams.length
  const rounds = n - 1
  const out: Pairing[] = []
  for (let r = 0; r < rounds; r++) {
    for (let i = 0; i < n / 2; i++) {
      const a = teams[i], b = teams[n - 1 - i]
      if (a && b) out.push({ round: r + 1, teamA: a, teamB: b })
    }
    teams.splice(1, 0, teams.pop() as string | null)
  }
  if (!doubleRound) return out
  return [...out, ...out.map(p => ({ round: p.round + rounds, teamA: p.teamB, teamB: p.teamA }))]
}
