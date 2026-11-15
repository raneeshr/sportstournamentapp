import Link from 'next/link'
import { createServerClient, getTournaments } from '@sportapp/supabase'

export const revalidate = 60
export default async function Browse() {
  const list = await getTournaments(createServerClient())
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold">Tournaments</h1>
      <ul className="space-y-3">{list.map(t => (
        <li key={t.id}><Link href={`/t/${t.slug}`} className="block rounded-xl border p-4 hover:bg-gray-50">
          <span className="text-sm text-gray-500">{t.sport?.icon} {t.sport?.name}</span><div className="font-medium">{t.name}</div></Link></li>))}
      </ul>
    </main>
  )
}
