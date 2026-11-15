'use client'
import { useState } from 'react'
import { buildShareUrl, defaultShareMessage, type SharePlatform } from '@sportapp/utils'
import { createBrowserClient, logShareEvent } from '@sportapp/supabase'

const targets: { id: SharePlatform; label: string }[] = [
  { id: 'whatsapp', label: 'WhatsApp' }, { id: 'telegram', label: 'Telegram' },
  { id: 'facebook', label: 'Facebook' }, { id: 'twitter', label: 'X' },
  { id: 'linkedin', label: 'LinkedIn' }, { id: 'email', label: 'Email' },
]

export default function ShareButtons({ tournamentId, name, url }: { tournamentId: string; name: string; url: string }) {
  const [message, setMessage] = useState(defaultShareMessage(name, url))
  const [copied, setCopied] = useState(false)

  const log = (p: SharePlatform) => logShareEvent(createBrowserClient(), tournamentId, p).catch(() => {})

  async function copy() {
    await navigator.clipboard.writeText(url); setCopied(true); log('copy_link'); setTimeout(() => setCopied(false), 1500)
  }
  async function native() {
    if (navigator.share) { await navigator.share({ title: name, text: message, url }); log('other') }
  }

  return (
    <div className="space-y-3 rounded-xl border p-4">
      <textarea className="w-full rounded border p-2 text-sm" rows={2} value={message} onChange={e => setMessage(e.target.value)} />
      <div className="flex flex-wrap gap-2">
        {targets.map(t => (
          <a key={t.id} href={buildShareUrl(t.id, url, message) ?? '#'} target="_blank" rel="noopener noreferrer"
             onClick={() => log(t.id)} className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50">{t.label}</a>
        ))}
        <button onClick={copy} className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50">{copied ? 'Copied' : 'Copy link'}</button>
        <button onClick={native} className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50">More…</button>
      </div>
    </div>
  )
}
