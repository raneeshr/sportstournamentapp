import Link from 'next/link'

const features = [
  ['Any sport', 'Badminton, volleyball, football or add your own.'],
  ['Flexible formats', 'Round robin, knockout, group stage and more.'],
  ['Court scheduling', 'Assign courts and times with conflict detection.'],
  ['Share instantly', 'One link for WhatsApp and social media with rich previews.'],
  ['Sponsors', 'Tiered sponsor placements with click analytics.'],
  ['Event limits', 'Cap how many events each player can enter.'],
]

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-20">
      <h1 className="text-4xl font-semibold">Run your tournament, any sport.</h1>
      <p className="mt-4 text-lg text-gray-600">Teams, schedules, courts, live scores and sponsors in one place.</p>
      <div className="mt-8 flex gap-3">
        <Link href="/login" className="rounded-lg bg-brand px-5 py-2.5 text-white">Get started</Link>
        <Link href="/sports" className="rounded-lg border px-5 py-2.5">Browse tournaments</Link>
      </div>
      <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map(([t, d]) => (
          <div key={t} className="rounded-xl border p-5"><h3 className="font-medium">{t}</h3><p className="mt-1 text-sm text-gray-600">{d}</p></div>
        ))}
      </div>
    </main>
  )
}
