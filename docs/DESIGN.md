# Design spec

## Tokens (`packages/ui/tokens`)
Primary `#534AB7` (light `#EEEDFE`, dark `#3C3489`), success `#0F6E56`, warning `#633806`, danger `#A32D2D`.

## Mobile screens
1. **Sport picker (first launch)**: grid of sports (Badminton, Volleyball, Football, Basketball, Table Tennis, Tennis…), multi-select, "Add your own sport", Continue.
2. **Dashboard**: sport switcher pills at top (active sport filters everything), my teams with W/L, active tournaments with next matches, standings.
3. **Teams / Tournaments / Schedule / Profile** tabs, all filtered by active sport.
4. **Select events**: event cards (Men's Singles, Men's Doubles, Mixed Doubles…) with a limit bar "2 of 2 max"; extra events disabled once the limit is reached.

## Web: admin
1. **Tournament editor**: name, sport, format, max teams, **max events per player** stepper, allow-admin-override toggle, event formats list (players per team, max entries, gender rule).
2. **Share**: public link with Copy, WhatsApp / Telegram / Facebook / X / LinkedIn / Email / More, editable message, share analytics by platform.
3. **Sponsors**: tiers Title / Gold / Silver / Community; logo, banner, website URL, tagline, order; click analytics.
4. **Schedule match**: teams, venue, court, date, start time, duration, optional referee; conflict detection on save.
5. **Court timetable**: time rows × court columns for a chosen day; empty slots open the schedule form pre-filled.
6. **Event roster**: players with event pills and `n/limit` badge; over-limit rows flagged with the override reason (Revoke / Edit reason).

## Web: public tournament page `/t/[slug]`
Header (sport, format, venue + directions) → sponsor block by tier → standings → upcoming matches (date, court, teams) → results with set-by-set scores (winner highlighted) → share panel. Server-rendered with Open Graph tags so WhatsApp/social previews work; live updates via Supabase Realtime.
