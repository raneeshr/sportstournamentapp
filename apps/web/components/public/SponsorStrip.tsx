'use client'
import { createBrowserClient, logSponsorClick } from '@sportapp/supabase'

type Sponsor = { id: string; name: string; logo_url: string | null; banner_url: string | null; website_url: string | null; tagline: string | null; tier: 'title' | 'gold' | 'silver' | 'community'; display_order: number }

export default function SponsorStrip({ sponsors, tournamentId }: { sponsors: Sponsor[]; tournamentId: string }) {
  if (!sponsors.length) return null
  const by = (tier: Sponsor['tier']) => sponsors.filter(s => s.tier === tier).sort((a, b) => a.display_order - b.display_order)
  const click = (s: Sponsor) => logSponsorClick(createBrowserClient(), s.id, tournamentId).catch(() => {})
  const Logo = ({ s, size }: { s: Sponsor; size: number }) => (
    <a href={s.website_url ?? '#'} target="_blank" rel="noopener noreferrer sponsored" onClick={() => click(s)} className="flex items-center gap-3">
      {s.logo_url ? <img src={s.logo_url} alt={s.name} style={{ height: size }} className="object-contain" />
        : <span className="flex items-center justify-center rounded bg-gray-100 font-medium" style={{ height: size, width: size }}>{s.name[0]}</span>}
      <span className="text-sm font-medium">{s.name}</span>
    </a>
  )
  return (
    <section className="space-y-4">
      <h2 className="text-xs font-medium uppercase tracking-wide text-gray-500">Sponsors</h2>
      {by('title').map(s => (
        <div key={s.id} className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          {s.banner_url && <img src={s.banner_url} alt={s.name} className="mb-3 w-full rounded-lg" />}
          <Logo s={s} size={44} />{s.tagline && <p className="mt-1 text-xs text-amber-900">{s.tagline}</p>}
        </div>
      ))}
      <div className="grid gap-3 sm:grid-cols-2">{by('gold').map(s => <div key={s.id} className="rounded-lg border p-3"><Logo s={s} size={32} /></div>)}</div>
      <div className="flex flex-wrap gap-4">{by('silver').map(s => <Logo key={s.id} s={s} size={24} />)}</div>
      <p className="text-xs text-gray-500">{by('community').map(s => s.name).join(' · ')}</p>
    </section>
  )
}
