-- SportApp full schema. Run in the Supabase SQL editor.
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE sports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE, icon TEXT,
  score_type TEXT NOT NULL DEFAULT 'sets' CHECK (score_type IN ('sets','halves','quarters','points')),
  default_format TEXT NOT NULL DEFAULT 'round_robin'
    CHECK (default_format IN ('round_robin','single_elimination','double_elimination','group_stage_knockout','swiss')),
  is_custom BOOLEAN NOT NULL DEFAULT FALSE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
INSERT INTO sports (name, icon, score_type, default_format) VALUES
  ('Badminton','🏸','sets','round_robin'), ('Volleyball','🏐','sets','round_robin'),
  ('Football','⚽','halves','round_robin'), ('Basketball','🏀','quarters','single_elimination'),
  ('Table Tennis','🏓','sets','round_robin'), ('Tennis','🎾','sets','single_elimination'),
  ('Cricket','🏏','points','round_robin'), ('Netball','🥅','quarters','round_robin');

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL, avatar_url TEXT,
  gender TEXT CHECK (gender IN ('male','female','other')),
  role TEXT NOT NULL DEFAULT 'player' CHECK (role IN ('super_admin','tournament_admin','team_manager','player')),
  default_sport_id UUID REFERENCES sports(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE OR REPLACE FUNCTION handle_new_user() RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, avatar_url)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), NEW.raw_user_meta_data->>'avatar_url');
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE TABLE profile_sports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  sport_id UUID NOT NULL REFERENCES sports(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), UNIQUE (profile_id, sport_id)
);

CREATE TABLE venues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), name TEXT NOT NULL, address TEXT, city TEXT, maps_url TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE courts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  name TEXT NOT NULL, description TEXT, court_number INT, is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), name TEXT NOT NULL, logo_url TEXT,
  sport_id UUID NOT NULL REFERENCES sports(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive','disbanded')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'player' CHECK (role IN ('manager','player')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), UNIQUE (team_id, player_id)
);

CREATE TABLE tournaments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), name TEXT NOT NULL, slug TEXT NOT NULL UNIQUE, description TEXT,
  sport_id UUID NOT NULL REFERENCES sports(id) ON DELETE RESTRICT,
  format TEXT NOT NULL DEFAULT 'round_robin'
    CHECK (format IN ('round_robin','single_elimination','double_elimination','group_stage_knockout','swiss')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','registration','active','completed','cancelled')),
  max_teams INT NOT NULL DEFAULT 16,
  max_events_per_player INT NOT NULL DEFAULT 2,
  allow_admin_override BOOLEAN NOT NULL DEFAULT TRUE,
  venue_id UUID REFERENCES venues(id) ON DELETE SET NULL,
  cover_image_url TEXT, og_title TEXT, og_description TEXT,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  start_date TIMESTAMPTZ, end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE OR REPLACE FUNCTION generate_tournament_slug(p_name TEXT) RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE base_slug TEXT; final_slug TEXT; counter INT := 0;
BEGIN
  base_slug := LOWER(REGEXP_REPLACE(TRIM(p_name), '[^a-zA-Z0-9\s]', '', 'g'));
  base_slug := REGEXP_REPLACE(base_slug, '\s+', '-', 'g');
  final_slug := base_slug;
  WHILE EXISTS (SELECT 1 FROM tournaments WHERE slug = final_slug) LOOP
    counter := counter + 1; final_slug := base_slug || '-' || counter;
  END LOOP;
  RETURN final_slug;
END; $$;

CREATE TABLE tournament_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  name TEXT NOT NULL, event_type TEXT NOT NULL,
  min_players_per_team INT NOT NULL DEFAULT 1, max_players_per_team INT NOT NULL DEFAULT 1,
  max_registrations INT,
  gender_rule TEXT NOT NULL DEFAULT 'open' CHECK (gender_rule IN ('open','male','female','mixed')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE, display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE tournament_teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), UNIQUE (tournament_id, team_id)
);
-- A player belongs to only one team per tournament
CREATE TABLE tournament_players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), UNIQUE (tournament_id, player_id)
);

CREATE TABLE player_event_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES tournament_events(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  partner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending','confirmed','withdrawn')),
  admin_override BOOLEAN NOT NULL DEFAULT FALSE, override_reason TEXT,
  registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), UNIQUE (event_id, player_id)
);
CREATE OR REPLACE FUNCTION check_player_event_limit() RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE current_count INT; max_allowed INT; override_ok BOOLEAN;
BEGIN
  IF NEW.status = 'withdrawn' THEN RETURN NEW; END IF;
  SELECT max_events_per_player, allow_admin_override INTO max_allowed, override_ok
    FROM tournaments WHERE id = NEW.tournament_id;
  SELECT COUNT(*) INTO current_count FROM player_event_registrations
    WHERE tournament_id = NEW.tournament_id AND player_id = NEW.player_id
      AND status <> 'withdrawn' AND id <> NEW.id;
  IF current_count >= max_allowed AND NOT (NEW.admin_override AND override_ok) THEN
    RAISE EXCEPTION 'Player has reached the maximum of % events for this tournament.', max_allowed;
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER enforce_player_event_limit BEFORE INSERT OR UPDATE ON player_event_registrations
  FOR EACH ROW EXECUTE FUNCTION check_player_event_limit();

CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  event_id UUID REFERENCES tournament_events(id) ON DELETE SET NULL,
  court_id UUID REFERENCES courts(id) ON DELETE SET NULL,
  team_a_id UUID NOT NULL REFERENCES teams(id) ON DELETE RESTRICT,
  team_b_id UUID NOT NULL REFERENCES teams(id) ON DELETE RESTRICT,
  round INT NOT NULL DEFAULT 1,
  stage TEXT NOT NULL DEFAULT 'group'
    CHECK (stage IN ('group','round_of_16','quarter_final','semi_final','final','third_place')),
  status TEXT NOT NULL DEFAULT 'scheduled'
    CHECK (status IN ('scheduled','in_progress','completed','cancelled','postponed')),
  scheduled_at TIMESTAMPTZ, duration_minutes INT NOT NULL DEFAULT 60, played_at TIMESTAMPTZ,
  winner_team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (team_a_id <> team_b_id)
);
CREATE OR REPLACE FUNCTION check_court_availability() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.court_id IS NULL OR NEW.scheduled_at IS NULL OR NEW.status IN ('cancelled','postponed') THEN RETURN NEW; END IF;
  IF EXISTS (
    SELECT 1 FROM matches WHERE court_id = NEW.court_id AND id <> NEW.id
      AND status NOT IN ('cancelled','postponed')
      AND scheduled_at < NEW.scheduled_at + make_interval(mins => NEW.duration_minutes)
      AND scheduled_at + make_interval(mins => duration_minutes) > NEW.scheduled_at
  ) THEN RAISE EXCEPTION 'Court is already booked during this time slot.'; END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER enforce_court_availability BEFORE INSERT OR UPDATE ON matches
  FOR EACH ROW EXECUTE FUNCTION check_court_availability();

CREATE TABLE match_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  segment_number INT NOT NULL, segment_label TEXT NOT NULL DEFAULT 'Set',
  score_a INT NOT NULL DEFAULT 0, score_b INT NOT NULL DEFAULT 0, is_complete BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), UNIQUE (match_id, segment_number)
);
CREATE TABLE match_officials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'referee' CHECK (role IN ('referee','umpire','line_judge','scorer')),
  UNIQUE (match_id, profile_id)
);
CREATE TABLE standings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  event_id UUID REFERENCES tournament_events(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  played INT NOT NULL DEFAULT 0, won INT NOT NULL DEFAULT 0, lost INT NOT NULL DEFAULT 0, drawn INT NOT NULL DEFAULT 0,
  points INT NOT NULL DEFAULT 0, sets_won INT NOT NULL DEFAULT 0, sets_lost INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX standings_unique ON standings (tournament_id, team_id, COALESCE(event_id, '00000000-0000-0000-0000-000000000000'::uuid));

CREATE TABLE tournament_sponsors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  name TEXT NOT NULL, logo_url TEXT, banner_url TEXT, website_url TEXT, tagline TEXT,
  tier TEXT NOT NULL DEFAULT 'silver' CHECK (tier IN ('title','gold','silver','community')),
  display_order INT NOT NULL DEFAULT 0, is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE tournament_share_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  shared_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  platform TEXT NOT NULL CHECK (platform IN ('whatsapp','telegram','facebook','twitter','instagram','linkedin','email','copy_link','other')),
  shared_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE sponsor_click_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sponsor_id UUID NOT NULL REFERENCES tournament_sponsors(id) ON DELETE CASCADE,
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  source TEXT NOT NULL DEFAULT 'web' CHECK (source IN ('web','mobile')),
  clicked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_teams_sport ON teams(sport_id);
CREATE INDEX idx_tournaments_sport ON tournaments(sport_id);
CREATE INDEX idx_tournament_players ON tournament_players(tournament_id, player_id);
CREATE INDEX idx_player_event_reg ON player_event_registrations(tournament_id, player_id);
CREATE INDEX idx_matches_tournament ON matches(tournament_id);
CREATE INDEX idx_matches_court ON matches(court_id, scheduled_at);
CREATE INDEX idx_match_scores_match ON match_scores(match_id);

-- ROW LEVEL SECURITY
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;      ALTER TABLE profile_sports ENABLE ROW LEVEL SECURITY;
ALTER TABLE sports ENABLE ROW LEVEL SECURITY;        ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE courts ENABLE ROW LEVEL SECURITY;        ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;  ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_events ENABLE ROW LEVEL SECURITY; ALTER TABLE tournament_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_players ENABLE ROW LEVEL SECURITY; ALTER TABLE player_event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;       ALTER TABLE match_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_officials ENABLE ROW LEVEL SECURITY; ALTER TABLE standings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_sponsors ENABLE ROW LEVEL SECURITY; ALTER TABLE tournament_share_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsor_click_events ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin','tournament_admin'))
$$;

-- Public read on everything shown on the public tournament pages
CREATE POLICY read_all ON sports FOR SELECT USING (TRUE);
CREATE POLICY read_all ON venues FOR SELECT USING (TRUE);
CREATE POLICY read_all ON courts FOR SELECT USING (TRUE);
CREATE POLICY read_all ON teams FOR SELECT USING (TRUE);
CREATE POLICY read_all ON team_members FOR SELECT USING (TRUE);
CREATE POLICY read_all ON tournaments FOR SELECT USING (TRUE);
CREATE POLICY read_all ON tournament_events FOR SELECT USING (TRUE);
CREATE POLICY read_all ON tournament_teams FOR SELECT USING (TRUE);
CREATE POLICY read_all ON tournament_players FOR SELECT USING (TRUE);
CREATE POLICY read_all ON matches FOR SELECT USING (TRUE);
CREATE POLICY read_all ON match_scores FOR SELECT USING (TRUE);
CREATE POLICY read_all ON match_officials FOR SELECT USING (TRUE);
CREATE POLICY read_all ON standings FOR SELECT USING (TRUE);
CREATE POLICY read_all ON tournament_sponsors FOR SELECT USING (TRUE);
CREATE POLICY read_all ON profiles FOR SELECT USING (TRUE);

-- Admin write
CREATE POLICY admin_write ON sports FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY admin_write ON venues FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY admin_write ON courts FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY admin_write ON tournaments FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY admin_write ON tournament_events FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY admin_write ON tournament_teams FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY admin_write ON tournament_players FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY admin_write ON matches FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY admin_write ON match_scores FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY admin_write ON match_officials FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY admin_write ON standings FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY admin_write ON tournament_sponsors FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY admin_all ON tournament_share_events FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY admin_read ON sponsor_click_events FOR SELECT USING (is_admin());
CREATE POLICY anyone_click ON sponsor_click_events FOR INSERT WITH CHECK (TRUE);

-- Users manage their own profile (but cannot promote themselves: role changes are admin-only via service role)
CREATE POLICY own_update ON profiles FOR UPDATE USING (id = auth.uid())
  WITH CHECK (id = auth.uid() AND role = (SELECT role FROM profiles WHERE id = auth.uid()));
CREATE POLICY own_rows ON profile_sports FOR ALL USING (profile_id = auth.uid()) WITH CHECK (profile_id = auth.uid());

-- Teams: creator or admin manages
CREATE POLICY team_insert ON teams FOR INSERT WITH CHECK (created_by = auth.uid());
CREATE POLICY team_manage ON teams FOR UPDATE USING (created_by = auth.uid() OR is_admin());
CREATE POLICY team_delete ON teams FOR DELETE USING (created_by = auth.uid() OR is_admin());
CREATE POLICY member_manage ON team_members FOR ALL
  USING (is_admin() OR EXISTS (SELECT 1 FROM teams t WHERE t.id = team_id AND t.created_by = auth.uid()))
  WITH CHECK (is_admin() OR EXISTS (SELECT 1 FROM teams t WHERE t.id = team_id AND t.created_by = auth.uid()));

-- Event registrations: players see/join their own, admins everything
CREATE POLICY reg_read ON player_event_registrations FOR SELECT USING (player_id = auth.uid() OR is_admin());
CREATE POLICY reg_insert ON player_event_registrations FOR INSERT
  WITH CHECK (is_admin() OR (player_id = auth.uid() AND admin_override = FALSE));
CREATE POLICY reg_update ON player_event_registrations FOR UPDATE USING (is_admin());

ALTER PUBLICATION supabase_realtime ADD TABLE match_scores, matches, standings;
