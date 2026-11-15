# SportsTournament

Cross-platform sports tournament manager (badminton, volleyball, or any sport): teams, tournaments, court scheduling, live scores, sponsors, shareable public pages.

- **Web**: Next.js 14 (`apps/web`): landing page, public tournament viewer, admin panel, player portal
- **Mobile**: React Native + Expo (`apps/mobile`)
- **Backend**: Supabase (Postgres, Auth, Realtime, Storage), shared by both apps

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) and [`docs/DESIGN.md`](docs/DESIGN.md).

## Setup
1. Create a Supabase project, then run `packages/supabase/migrations/001_initial_schema.sql` in the SQL editor.
2. Copy env files: `apps/web/.env.example` → `apps/web/.env.local`, `apps/mobile/.env.example` → `apps/mobile/.env`.
3. Install and run:
   ```bash
   npm install
   npm run dev --workspace @sportapp/web      # http://localhost:3000
   npm run dev --workspace @sportapp/mobile   # Expo
   ```
4. Sign up in the app, then promote yourself to admin (SQL editor):
   ```sql
   update profiles set role = 'super_admin' where id = '<your-user-id>';
   ```

## Status
Done: schema + RLS + triggers, typed API helpers, schedule/bracket generators, public tournament page (standings, schedule, results, sponsors, share), mobile auth + sport picker + switcher + list screens.
Next: admin forms (tournament/events/sponsors/match scheduling/score entry), auth middleware for `/admin`, player portal, realtime subscriptions, mobile schedule screen.
