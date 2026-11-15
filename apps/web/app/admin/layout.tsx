import Link from 'next/link'
const nav = [['Overview', '/admin'], ['Sports', '/admin/sports'], ['Teams', '/admin/teams'], ['Tournaments', '/admin/tournaments'], ['Matches', '/admin/matches'], ['Users', '/admin/users']]

// TODO: protect with Supabase auth middleware (role in super_admin | tournament_admin).
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-52 space-y-1 border-r p-4">{nav.map(([l, h]) => <Link key={h} href={h} className="block rounded px-3 py-2 text-sm hover:bg-gray-100">{l}</Link>)}</aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  )
}
