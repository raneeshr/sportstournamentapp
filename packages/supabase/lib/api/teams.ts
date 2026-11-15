import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../../types/database.types'
// Loosely typed on purpose: embedded joins need generated types (npx supabase gen types), see README.
type Client = SupabaseClient<any>
type TeamInsert = Database['public']['Tables']['teams']['Insert']

export async function getTeams(c: Client, sportId?: string) {
  let q = c.from('teams').select('*, sport:sports(*), members:team_members(count)')
  if (sportId) q = q.eq('sport_id', sportId)
  const { data, error } = await q.order('name')
  if (error) throw error
  return data
}
export async function getTeam(c: Client, id: string) {
  const { data, error } = await c.from('teams').select('*, sport:sports(*), members:team_members(*, player:profiles(*))').eq('id', id).single()
  if (error) throw error
  return data
}
export async function createTeam(c: Client, team: TeamInsert) {
  const { data, error } = await c.from('teams').insert(team).select().single()
  if (error) throw error
  // creator becomes team manager
  await c.from('team_members').insert({ team_id: data.id, player_id: team.created_by, role: 'manager' })
  return data
}
export async function updateTeam(c: Client, id: string, updates: Database['public']['Tables']['teams']['Update']) {
  const { data, error } = await c.from('teams').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select().single()
  if (error) throw error
  return data
}
export async function addTeamMember(c: Client, teamId: string, playerId: string, role: 'manager' | 'player' = 'player') {
  const { data, error } = await c.from('team_members').insert({ team_id: teamId, player_id: playerId, role }).select().single()
  if (error) throw error
  return data
}
export async function removeTeamMember(c: Client, teamId: string, playerId: string) {
  const { error } = await c.from('team_members').delete().eq('team_id', teamId).eq('player_id', playerId)
  if (error) throw error
}
