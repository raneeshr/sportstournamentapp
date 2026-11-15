'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Login() {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [msg, setMsg] = useState('')
  async function signIn() {
    const { error } = await supabase().auth.signInWithPassword({ email, password })
    setMsg(error ? error.message : 'Signed in')
  }
  async function signUp() {
    const { error } = await supabase().auth.signUp({ email, password })
    setMsg(error ? error.message : 'Check your email to confirm')
  }
  return (
    <main className="mx-auto mt-24 max-w-sm space-y-3 px-6">
      <h1 className="text-2xl font-semibold">Sign in</h1>
      <input className="w-full rounded border p-2" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input className="w-full rounded border p-2" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
      <div className="flex gap-2">
        <button onClick={signIn} className="flex-1 rounded bg-brand p-2 text-white">Sign in</button>
        <button onClick={signUp} className="flex-1 rounded border p-2">Sign up</button>
      </div>
      {msg && <p className="text-sm text-gray-600">{msg}</p>}
    </main>
  )
}
