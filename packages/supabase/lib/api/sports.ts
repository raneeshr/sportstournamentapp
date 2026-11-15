import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../../types/database.types'
// Loosely typed on purpose: embedded joins need generated types (npx supabase gen types), see README.
type Client = SupabaseClient<any>

export async function getSports(c: Client) {
  const { data, error } = await c.from('sports').select('*').order('name')
  if (error) throw error
  return data
}
export async function createSport(c: Client, name: string, icon = '🏅', score_type: 'sets' | 'halves' | 'quarters' | 'points' = 'points') {
  const { data, error } = await c.from('sports').insert({ name, icon, score_type, is_custom: true }).select().single()
  if (error) throw error
  return data
}
export async function getProfileSports(c: Client, profileId: string) {
  const { data, error } = await c.from('profile_sports').select('*, sport:sports(*)').eq('profile_id', profileId)
  if (error) throw error
  return data
}
export async function followSport(c: Client, profileId: string, sportId: string) {
  const { error } = await c.from('profile_sports').upsert({ profile_id: profileId, sport_id: sportId }, { onConflict: 'profile_id,sport_id' })
  if (error) throw error
}
export async function unfollowSport(c: Client, profileId: string, sportId: string) {
  const { error } = await c.from('profile_sports').delete().eq('profile_id', profileId).eq('sport_id', sportId)
  if (error) throw error
}
export async function setDefaultSport(c: Client, profileId: string, sportId: string) {
  const { error } = await c.from('profiles').update({ default_sport_id: sportId }).eq('id', profileId)
  if (error) throw error
}
