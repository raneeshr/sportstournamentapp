import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../../types/database.types'
// Loosely typed on purpose: embedded joins need generated types (npx supabase gen types), see README.
type Client = SupabaseClient<any>

export async function getStandings(c: Client, tournamentId: string, eventId?: string) {
  let q = c.from('standings').select('*, team:teams(id, name, logo_url)').eq('tournament_id', tournamentId)
    .order('points', { ascending: false }).order('sets_won', { ascending: false })
  if (eventId) q = q.eq('event_id', eventId)
  const { data, error } = await q
  if (error) throw error
  return data
}

/** Rebuilds standings from completed matches (3 pts win, 1 draw). Run after a score is finalised. */
export async function recalculateStandings(c: Client, tournamentId: string) {
  const { data: matches, error } = await c.from('matches').select('*, scores:match_scores(*)')
    .eq('tournament_id', tournamentId).eq('status', 'completed')
  if (error) throw error

  type Row = { event_id: string | null; team_id: string; played: number; won: number; lost: number; drawn: number; points: number; sets_won: number; sets_lost: number }
  const table = new Map<string, Row>()
  const row = (event_id: string | null, team_id: string) => {
    const k = `${event_id ?? 'all'}|${team_id}`
    if (!table.has(k)) table.set(k, { event_id, team_id, played: 0, won: 0, lost: 0, drawn: 0, points: 0, sets_won: 0, sets_lost: 0 })
    return table.get(k)!
  }
  for (const m of matches as any[]) {
    const a = row(m.event_id, m.team_a_id), b = row(m.event_id, m.team_b_id)
    const sa = m.scores.filter((s: { score_a: number; score_b: number }) => s.score_a > s.score_b).length
    const sb = m.scores.filter((s: { score_a: number; score_b: number }) => s.score_b > s.score_a).length
    a.played++; b.played++; a.sets_won += sa; a.sets_lost += sb; b.sets_won += sb; b.sets_lost += sa
    if (sa > sb) { a.won++; a.points += 3; b.lost++ }
    else if (sb > sa) { b.won++; b.points += 3; a.lost++ }
    else { a.drawn++; b.drawn++; a.points++; b.points++ }
  }
  const { error: delErr } = await c.from('standings').delete().eq('tournament_id', tournamentId)
  if (delErr) throw delErr
  const rows = [...table.values()].map(r => ({ tournament_id: tournamentId, ...r }))
  if (rows.length) {
    const { error: insErr } = await c.from('standings').insert(rows)
    if (insErr) throw insErr
  }
}
