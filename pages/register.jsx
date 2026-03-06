import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { supabase } from '../lib/supabaseClient'

export default function Register() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '', username: '', display_name: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    if (form.username.length < 3) { setError('Username deve essere almeno 3 caratteri.'); return }
    setLoading(true)
    const { error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { username: form.username.toLowerCase(), display_name: form.display_name } },
    })
    if (signUpError) { setError(signUpError.message); setLoading(false); return }
    router.push('/dashboard?welcome=1')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia, serif', padding: '24px' }}>
      <div style={{ background: '#1a1010', border: '1px solid #3a2020', borderRadius: '16px', padding: '48px 40px', width: '100%', maxWidth: '560px' }}>
        <div style={{ fontSize: '20px', color: '#e8320a', marginBottom: '24px' }}>🌶️ Hola Mamacita</div>
        <h1 style={{ fontSize: '28px', color: '#f5e6e0', margin: '0 0 8px' }}>Crea il tuo profilo</h1>
        <p style={{ color: '#9a7a72', margin: '0 0 32px' }}>Registrati e inizia a gestire la tua presenza</p>
        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', color: '#9a7a72', fontFamily: 'monospace', textTransform: 'uppercase' }}>Nome d arte</label>
              <input style={{ background: '#120c0c', border: '1px solid #3a2020', borderRadius: '8px', padding: '12px 14px', color: '#f5e6e0', fontSize: '15px', outline: 'none' }} name="display_name" placeholder="Es. Sofia Caliente" value={form.display_name} onChange={handle} required />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', color: '#9a7a72', fontFamily: 'monospace', textTransform: 'uppercase' }}>Username</label>
              <input style={{ background: '#120c0c', border: '1px solid #3a2020', borderRadius: '8px', padding: '12px 14px', color: '#f5e6e0', fontSize: '15px', outline: 'none' }} name="username" placeholder="Es. sofiacaliente" value={form.username} onChange={handle} required />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', color: '#9a7a72', fontFamily: 'monospace', textTransform: 'uppercase' }}>Email</label>
            <input style={{ background: '#120c0c', border: '1px solid #3a2020', borderRadius: '8px', padding: '12px 14px', color: '#f5e6e0', fontSize: '15px', outline: 'none' }} name="email" type="email" placeholder="tu@email.com" value={form.email} onChange={handle} required />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', color: '#9a7a72', fontFamily: 'monospace', textTransform: 'uppercase' }}>Password</label>
            <input style={{ background: '#120c0c', border: '1px solid #3a2020', borderRadius: '8px', padding: '12px 14px', color: '#f5e6e0', fontSize: '15px', outline: 'none' }} name="password" type="password" placeholder="Minimo 6 caratteri" value={form.password} onChange={handle} required minLength={6} />
          </div>
          {error && <div style={{ background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.3)', color: '#ff4444', borderRadius: '8px', padding: '12px 14px', fontSize: '14px' }}>{error}</div>}
          <button style={{ background: loading ? '#3a2020' : '#e8320a', color: '#fff', border: 'none', borderRadius: '8px', padding: '14px', fontSize: '16px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer' }} type="submit" disabled={loading}>{loading ? 'Registrazione...' : 'Crea account 🌶️'}</button>
        </form>
        <p style={{ textAlign: 'center', color: '#9a7a72', fontSize: '14px', marginTop: '24px' }}>Hai già un account? <a href="/login" style={{ color: '#e8320a', textDecoration: 'none', fontWeight: '600' }}>Accedi</a></p>
      </div>
    </div>
  )
}
