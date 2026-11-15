import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createServerClient, getTournamentBySlug, getMatches, getStandings } from '@sportapp/supabase'
import { tournamentUrl } from '@sportapp/utils'
import ShareButtons from '@/components/public/ShareButtons'
import SponsorStrip from '@/components/public/SponsorStrip'

export const revalidate = 30
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

async function load(slug: string) {
  const c = createServerClient()
  try { return { c, t: await getTournamentBySlug(c, slug) } } catch { return null }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const r = await load(params.slug)
  if (!r) return { title: 'Tournament not found' }
  const { t } = r
  const desc = t.og_description ?? `${t.sport?.name} · ${t.teams.length} teams — live standings and results`
  return {
    title: t.og_title ?? t.name, description: desc,
    openGraph: { title: t.name, description: desc, url: tournamentUrl(SITE, t.slug), images: t.cover_image_url ? [t.cover_image_url] : [] },
    twitter: { card: 'summary_large_image' },
  }
}

export default async function TournamentPage({ params }: { params: { slug: string } }) {
  const r = await load(params.slug)
  if (!r) notFound()
  const { c, t } = r!
  const [matches, standings] = await Promise.all([getMatches(c, t.id), getStandings(c, t.id)])
  const done = matches.filter(m => m.status === 'completed')
  const upcoming = matches.filter(m => m.status !== 'completed' && m.status !== 'cancelled')
  const fmt = (d: string | null) => d ? new Date(d).toLocaleString([], { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'TBC'

  const Match = ({ m }: { m: (typeof matches)[number] }) => {
    const sa = m.scores.filter(s => s.score_a > s.score_b).length, sb = m.scores.filter(s => s.score_b > s.score_a).length
    return (
      <div className="rounded-lg border p-3 text-sm">
        <div className="mb-1 flex flex-wrap gap-2 text-xs text-gray-500">
          <span>{fmt(m.scheduled_at)}</span>
          {m.court && <span className="rounded bg-brand-light px-1.5 text-brand-dark">{m.court.name}{m.court.venue ? ` · ${m.court.venue.name}` : ''}</span>}
          {m.event && <span>{m.event.name}</span>}
        </div>
        <div className="flex items-center justify-between">
          <span className={sa > sb ? 'font-semibold' : ''}>{m.team_a?.name}</span>
          <span className="font-medium">{m.status === 'completed' ? `${sa} – ${sb}` : 'vs'}</span>
          <span className={sb > sa ? 'font-semibold' : ''}>{m.team_b?.name}</span>
        </div>
        {m.status === 'completed' && <div className="mt-1 flex gap-1.5 text-xs text-gray-500">{[...m.scores].sort((x, y) => x.segment_number - y.segment_number).map(s => <span key={s.id}>{s.score_a}–{s.score_b}</span>)}</div>}
      </div>
    )
  }

  return (
    <main className="mx-auto max-w-3xl space-y-8 px-4 py-8">
      <header>
        <p className="text-sm text-gray-500">{t.sport?.icon} {t.sport?.name} · {t.format.replace(/_/g, ' ')}</p>
        <h1 className="text-3xl font-semibold">{t.name}</h1>
        {t.venue && <p className="mt-1 text-sm text-gray-600">{t.venue.name}{t.venue.address ? `, ${t.venue.address}` : ''} {t.venue.maps_url && <a className="text-brand underline" href={t.venue.maps_url}>Directions</a>}</p>}
        {t.description && <p className="mt-3 text-gray-700">{t.description}</p>}
      </header>

      <SponsorStrip sponsors={t.sponsors.filter(s => s.is_active)} tournamentId={t.id} />

      <section>
        <h2 className="mb-2 text-lg font-medium">Standings</h2>
        <table className="w-full text-sm"><thead className="text-left text-xs text-gray-500"><tr><th>#</th><th>Team</th><th>P</th><th>W</th><th>L</th><th>Pts</th></tr></thead>
          <tbody>{standings.map((s, i) => <tr key={s.id} className="border-t"><td className="py-1.5">{i + 1}</td><td>{s.team?.name}</td><td>{s.played}</td><td>{s.won}</td><td>{s.lost}</td><td className="font-medium">{s.points}</td></tr>)}</tbody></table>
      </section>

      <section className="space-y-2"><h2 className="text-lg font-medium">Upcoming matches</h2>{upcoming.length ? upcoming.map(m => <Match key={m.id} m={m} />) : <p className="text-sm text-gray-500">Nothing scheduled yet.</p>}</section>
      <section className="space-y-2"><h2 className="text-lg font-medium">Results</h2>{done.length ? done.map(m => <Match key={m.id} m={m} />) : <p className="text-sm text-gray-500">No completed matches yet.</p>}</section>

      <ShareButtons tournamentId={t.id} name={t.name} url={tournamentUrl(SITE, t.slug)} />
    </main>
  )
}
