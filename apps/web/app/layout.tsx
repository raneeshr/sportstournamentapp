import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SportsTournament — run tournaments for any sport',
  description: 'Manage teams, schedule matches on courts, share live standings.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en"><body className="bg-white text-gray-900 antialiased">{children}</body></html>
  )
}
