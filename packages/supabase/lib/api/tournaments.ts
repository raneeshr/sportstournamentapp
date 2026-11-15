import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../../types/database.types'
// Loosely typed on purpose: embedded joins need generated types (npx supabase gen types), see README.
type Client = SupabaseClient<any>
type T = Database['public']['Tables']
type SharePlatform = T['tournament_share_events']['Row']['platform']

export async function getTournaments(c: Client, sportId?: string) {
  let q = c.from('tournaments').select('*, sport:sports(*), venue:venues(*)').order('created_at', { ascending: false })
  if (sportId) q = q.eq('sport_id', sportId)
  const { data, error } = await q
  if (error) throw error
  return data
}
export async function getTournamentBySlug(c: Client, slug: string) {
  const { data, error } = await c.from('tournaments').select(`
    *, sport:sports(*), venue:venues(*, courts(*)), events:tournament_events(*),
    teams:tournament_teams(*, team:teams(*)), sponsors:tournament_sponsors(*)`).eq('slug', slug).single()
  if (error) throw error
  return data
}
/** Creates a tournament, generating a unique slug server-side via the SQL helper. */
export async function createTournament(c: Client, t: Omit<T['tournaments']['Insert'], 'slug'>) {
  const { data: slug, error: slugErr } = await (c as any).rpc('generate_tournament_slug', { p_name: t.name })
  if (slugErr) throw slugErr
  const { data, error } = await c.from('tournaments').insert({ ...t, slug } as T['tournaments']['Insert']).select().single()
  if (error) throw error
  return data
}
export async function updateTournament(c: Client, id: string, updates: T['tournaments']['Update']) {
  const { data, error } = await c.from('tournaments').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select().single()
  if (error) throw error
  return data
}
export async function createTournamentEvent(c: Client, e: T['tournament_events']['Insert']) {
  const { data, error } = await c.from('tournament_events').insert(e).select().single()
  if (error) throw error
  return data
}
/** DB trigger rejects the insert when the per-player event limit is exceeded. */
export async function registerPlayerForEvent(c: Client, reg: T['player_event_registrations']['Insert']) {
  const { data, error } = await c.from('player_event_registrations').insert(reg).select().single()
  if (error) throw error
  return data
}
export async function getPlayerEventRegistrations(c: Client, tournamentId: string, playerId: string) {
  const { data, error } = await c.from('player_event_registrations').select('*, event:tournament_events(*)')
    .eq('tournament_id', tournamentId).eq('player_id', playerId).neq('status', 'withdrawn')
  if (error) throw error
  return data
}
export async function getTournamentSponsors(c: Client, tournamentId: string) {
  const { data, error } = await c.from('tournament_sponsors').select('*').eq('tournament_id', tournamentId).eq('is_active', true).order('display_order')
  if (error) throw error
  return data
}
export async function upsertSponsor(c: Client, s: T['tournament_sponsors']['Insert'] & { id?: string }) {
  const { data, error } = await c.from('tournament_sponsors').upsert(s).select().single()
  if (error) throw error
  return data
}
export async function deleteSponsor(c: Client, id: string) {
  const { error } = await c.from('tournament_sponsors').delete().eq('id', id)
  if (error) throw error
}
export async function logShareEvent(c: Client, tournamentId: string, platform: SharePlatform, sharedBy?: string) {
  await c.from('tournament_share_events').insert({ tournament_id: tournamentId, platform, shared_by: sharedBy ?? null })
}
export async function logSponsorClick(c: Client, sponsorId: string, tournamentId: string, source: 'web' | 'mobile' = 'web') {
  await c.from('sponsor_click_events').insert({ sponsor_id: sponsorId, tournament_id: tournamentId, source })
}
export async function getShareAnalytics(c: Client, tournamentId: string) {
  const { data, error } = await c.from('tournament_share_events').select('platform').eq('tournament_id', tournamentId)
  if (error) throw error
  return data.reduce<Record<string, number>>((acc: Record<string, number>, { platform }: { platform: string }) => ({ ...acc, [platform]: (acc[platform] ?? 0) + 1 }), {})
}
