import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../../types/database.types'
// Loosely typed on purpose: embedded joins need generated types (npx supabase gen types), see README.
type Client = SupabaseClient<any>
type T = Database['public']['Tables']

export async function getMatches(c: Client, tournamentId: string) {
  const { data, error } = await c.from('matches').select(`
    *, team_a:teams!team_a_id(id, name, logo_url), team_b:teams!team_b_id(id, name, logo_url),
    court:courts(*, venue:venues(*)), event:tournament_events(id, name, event_type), scores:match_scores(*)`)
    .eq('tournament_id', tournamentId).order('scheduled_at')
  if (error) throw error
  return data
}
/** Throws 'Court is already booked during this time slot.' on conflict (DB trigger). */
export async function scheduleMatch(c: Client, m: T['matches']['Insert']) {
  const { data, error } = await c.from('matches').insert(m).select().single()
  if (error) throw error
  return data
}
export async function updateMatch(c: Client, id: string, updates: T['matches']['Update']) {
  const { data, error } = await c.from('matches').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select().single()
  if (error) throw error
  return data
}
export async function upsertMatchScore(c: Client, s: T['match_scores']['Insert']) {
  const { data, error } = await c.from('match_scores').upsert(s, { onConflict: 'match_id,segment_number' }).select().single()
  if (error) throw error
  return data
}
/** Court timetable for one venue and day (all courts, ordered by time). */
export async function getCourtSchedule(c: Client, venueId: string, dayISO: string) {
  const start = new Date(dayISO); start.setHours(0, 0, 0, 0)
  const end = new Date(dayISO); end.setHours(23, 59, 59, 999)
  const { data: courts, error: ce } = await c.from('courts').select('id').eq('venue_id', venueId)
  if (ce) throw ce
  const { data, error } = await c.from('matches').select('*, team_a:teams!team_a_id(id, name), team_b:teams!team_b_id(id, name)')
    .in('court_id', courts.map((x: { id: string }) => x.id)).gte('scheduled_at', start.toISOString()).lte('scheduled_at', end.toISOString())
    .not('status', 'in', '(cancelled,postponed)').order('scheduled_at')
  if (error) throw error
  return data
}
