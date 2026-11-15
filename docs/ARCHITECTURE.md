# Architecture

One Supabase backend powers the Next.js website and the Expo mobile app.

```mermaid
flowchart TD
  Web[Web app - Next.js 14] --> SDK[Supabase JS client - shared package]
  Mobile[Mobile app - React Native + Expo] --> SDK
  SDK --> Auth[Auth + RLS]
  SDK --> DB[(Postgres)]
  SDK --> RT[Realtime - live scores]
  SDK --> Store[Storage - logos, avatars, sponsor banners]
  Web --> Pages[Landing / Public viewer / Admin panel / Player portal]
```

## Monorepo layout
| Path | Purpose |
|---|---|
| `apps/web` | Next.js: landing page, public tournament pages `/t/[slug]`, `/admin`, `/me` |
| `apps/mobile` | Expo Router app: sport picker, switcher, teams, tournaments, schedule |
| `packages/supabase` | SQL migration, typed client, API helpers |
| `packages/utils` | Round-robin + knockout generators, share URLs, event-limit helper |
| `packages/ui` | Shared design tokens |

## Data model (ERD)
```mermaid
erDiagram
  sports ||--o{ teams : categorises
  sports ||--o{ tournaments : defines
  profiles ||--o{ profile_sports : follows
  sports ||--o{ profile_sports : followed_by
  teams ||--o{ team_members : has
  profiles ||--o{ team_members : is
  tournaments ||--o{ tournament_events : has
  tournaments ||--o{ tournament_teams : includes
  tournaments ||--o{ tournament_players : locks_roster
  tournament_events ||--o{ player_event_registrations : entries
  profiles ||--o{ player_event_registrations : enters
  venues ||--o{ courts : has
  courts ||--o{ matches : hosts
  tournaments ||--o{ matches : contains
  matches ||--o{ match_scores : sets
  matches ||--o{ match_officials : officiated_by
  tournaments ||--o{ standings : tracks
  tournaments ||--o{ tournament_sponsors : has
  tournaments ||--o{ tournament_share_events : shares
  tournament_sponsors ||--o{ sponsor_click_events : clicks
```

## Key rules (enforced in Postgres)
- **One team per player per tournament**: `UNIQUE (tournament_id, player_id)` on `tournament_players`.
- **Event limit**: trigger `check_player_event_limit` blocks a player joining more than `tournaments.max_events_per_player` events (e.g. 2 of singles / doubles / mixed). Admins may override when `allow_admin_override` is on; overrides are flagged with a reason.
- **No court double-booking**: trigger `check_court_availability` rejects overlapping matches on the same court.
- **Sport-agnostic scoring**: `match_scores` stores one row per segment (set, half, quarter) with a label; `sports.score_type` drives the UI.
- **Roles**: `super_admin`, `tournament_admin`, `team_manager`, `player`. Public tables are readable by everyone; writes are admin-only (teams: creator or admin). Role changes are blocked for normal users.

## Roles
| Capability | Player | Team manager | Tournament admin | Super admin |
|---|---|---|---|---|
| View public tournaments, schedules, scores | ✓ | ✓ | ✓ | ✓ |
| Join events (within limit) | ✓ | ✓ | ✓ | ✓ |
| Create/manage own team | | ✓ | ✓ | ✓ |
| Create tournaments, schedule matches, enter scores | | | ✓ | ✓ |
| Manage sponsors, share links | | | ✓ | ✓ |
| Override event limit | | | ✓ | ✓ |
| Manage user roles | | | | ✓ |
