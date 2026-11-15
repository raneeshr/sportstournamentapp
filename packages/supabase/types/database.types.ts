// Hand-maintained to match migrations/001_initial_schema.sql.
// Regenerate anytime with: npx supabase gen types typescript --project-id <ref> > types/database.types.ts
type Tbl<Row, Auto extends keyof Row> = {
  Row: Row
  Insert: Omit<Row, Auto> & Partial<Pick<Row, Auto>>
  Update: Partial<Row>
  Relationships: []
}
type Fmt = 'round_robin' | 'single_elimination' | 'double_elimination' | 'group_stage_knockout' | 'swiss'

export type Database = {
  public: {
    Tables: {
      sports: Tbl<{ id: string; name: string; icon: string | null; score_type: 'sets' | 'halves' | 'quarters' | 'points'; default_format: Fmt; is_custom: boolean; created_by: string | null; created_at: string }, 'id' | 'created_at' | 'is_custom' | 'created_by' | 'icon' | 'score_type' | 'default_format'>
      profiles: Tbl<{ id: string; full_name: string; avatar_url: string | null; gender: 'male' | 'female' | 'other' | null; role: 'super_admin' | 'tournament_admin' | 'team_manager' | 'player'; default_sport_id: string | null; created_at: string; updated_at: string }, 'created_at' | 'updated_at' | 'role' | 'avatar_url' | 'gender' | 'default_sport_id'>
      profile_sports: Tbl<{ id: string; profile_id: string; sport_id: string; created_at: string }, 'id' | 'created_at'>
      venues: Tbl<{ id: string; name: string; address: string | null; city: string | null; maps_url: string | null; created_by: string | null; created_at: string }, 'id' | 'created_at' | 'address' | 'city' | 'maps_url' | 'created_by'>
      courts: Tbl<{ id: string; venue_id: string; name: string; description: string | null; court_number: number | null; is_active: boolean; created_at: string }, 'id' | 'created_at' | 'description' | 'court_number' | 'is_active'>
      teams: Tbl<{ id: string; name: string; logo_url: string | null; sport_id: string; created_by: string; status: 'active' | 'inactive' | 'disbanded'; created_at: string; updated_at: string }, 'id' | 'created_at' | 'updated_at' | 'status' | 'logo_url'>
      team_members: Tbl<{ id: string; team_id: string; player_id: string; role: 'manager' | 'player'; joined_at: string }, 'id' | 'joined_at' | 'role'>
      tournaments: Tbl<{ id: string; name: string; slug: string; description: string | null; sport_id: string; format: Fmt; status: 'draft' | 'registration' | 'active' | 'completed' | 'cancelled'; max_teams: number; max_events_per_player: number; allow_admin_override: boolean; venue_id: string | null; cover_image_url: string | null; og_title: string | null; og_description: string | null; created_by: string; start_date: string | null; end_date: string | null; created_at: string; updated_at: string }, 'id' | 'created_at' | 'updated_at' | 'format' | 'status' | 'max_teams' | 'max_events_per_player' | 'allow_admin_override' | 'description' | 'venue_id' | 'cover_image_url' | 'og_title' | 'og_description' | 'start_date' | 'end_date'>
      tournament_events: Tbl<{ id: string; tournament_id: string; name: string; event_type: string; min_players_per_team: number; max_players_per_team: number; max_registrations: number | null; gender_rule: 'open' | 'male' | 'female' | 'mixed'; is_active: boolean; display_order: number; created_at: string }, 'id' | 'created_at' | 'min_players_per_team' | 'max_players_per_team' | 'max_registrations' | 'gender_rule' | 'is_active' | 'display_order'>
      tournament_teams: Tbl<{ id: string; tournament_id: string; team_id: string; registered_at: string }, 'id' | 'registered_at'>
      tournament_players: Tbl<{ id: string; tournament_id: string; player_id: string; team_id: string; created_at: string }, 'id' | 'created_at'>
      player_event_registrations: Tbl<{ id: string; tournament_id: string; event_id: string; player_id: string; team_id: string; partner_id: string | null; status: 'pending' | 'confirmed' | 'withdrawn'; admin_override: boolean; override_reason: string | null; registered_at: string }, 'id' | 'registered_at' | 'partner_id' | 'status' | 'admin_override' | 'override_reason'>
      matches: Tbl<{ id: string; tournament_id: string; event_id: string | null; court_id: string | null; team_a_id: string; team_b_id: string; round: number; stage: 'group' | 'round_of_16' | 'quarter_final' | 'semi_final' | 'final' | 'third_place'; status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'postponed'; scheduled_at: string | null; duration_minutes: number; played_at: string | null; winner_team_id: string | null; created_at: string; updated_at: string }, 'id' | 'created_at' | 'updated_at' | 'event_id' | 'court_id' | 'round' | 'stage' | 'status' | 'scheduled_at' | 'duration_minutes' | 'played_at' | 'winner_team_id'>
      match_scores: Tbl<{ id: string; match_id: string; segment_number: number; segment_label: string; score_a: number; score_b: number; is_complete: boolean; created_at: string }, 'id' | 'created_at' | 'segment_label' | 'score_a' | 'score_b' | 'is_complete'>
      match_officials: Tbl<{ id: string; match_id: string; profile_id: string; role: 'referee' | 'umpire' | 'line_judge' | 'scorer' }, 'id' | 'role'>
      standings: Tbl<{ id: string; tournament_id: string; event_id: string | null; team_id: string; played: number; won: number; lost: number; drawn: number; points: number; sets_won: number; sets_lost: number; updated_at: string }, 'id' | 'updated_at' | 'event_id' | 'played' | 'won' | 'lost' | 'drawn' | 'points' | 'sets_won' | 'sets_lost'>
      tournament_sponsors: Tbl<{ id: string; tournament_id: string; name: string; logo_url: string | null; banner_url: string | null; website_url: string | null; tagline: string | null; tier: 'title' | 'gold' | 'silver' | 'community'; display_order: number; is_active: boolean; created_at: string }, 'id' | 'created_at' | 'logo_url' | 'banner_url' | 'website_url' | 'tagline' | 'tier' | 'display_order' | 'is_active'>
      tournament_share_events: Tbl<{ id: string; tournament_id: string; shared_by: string | null; platform: 'whatsapp' | 'telegram' | 'facebook' | 'twitter' | 'instagram' | 'linkedin' | 'email' | 'copy_link' | 'other'; shared_at: string }, 'id' | 'shared_at' | 'shared_by'>
      sponsor_click_events: Tbl<{ id: string; sponsor_id: string; tournament_id: string; source: 'web' | 'mobile'; clicked_at: string }, 'id' | 'clicked_at' | 'source'>
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
