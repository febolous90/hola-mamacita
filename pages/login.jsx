import { useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'

export default function Login() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: loginError } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password })
    if (loginError) { setError('Email o password non corretti.'); setLoading(false); return }
    router.push('/dashboard')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia, serif', padding: '24px' }}>
      <div style={{ background: '#1a1010', border: '1px solid #3a2020', borderRadius: '16px', padding: '48px 40px', width: '100%', maxWidth: '440px' }}>
        <div style={{ fontSize: '20px', color: '#e8320a', marginBottom: '24px' }}>🌶️ Hola Mamacita</div>
        <h1 style={{ fontSize: '32px', color: '#f5e6e0', margin: '0 0 8px' }}>Bentornata</h1>
        <p style={{ color: '#9a7a72', margin: '0 0 32px' }}>Accedi alla tua dashboard</p>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', color: '#9a7a72', fontFamily: 'monospace', textTransform: 'uppercase' }}>Email</label>
            <input style={{ background: '#120c0c', border: '1px solid #3a2020', borderRadius: '8px', padding: '12px 14px', color: '#f5e6e0', fontSize: '15px', outline: 'none' }} name='email' type='email' placeholder='tu@email.com' value={form.email} onChange={handle} required />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', color: '#9a7a72', fontFamily: 'monospace', textTransform: 'uppercase' }}>Password</label>
            <input style={{ background: '#120c0c', border: '1px solid #3a2020', borderRadius: '8px', padding: '12px 14px', color: '#f5e6e0', fontSize: '15px', outline: 'none' }} name='password' type='password' placeholder='••••••••' value={form.password} onChange={handle} required />
          </div>
          {error && <div style={{ background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.3)', color: '#ff4444', borderRadius: '8px', padding: '12px 14px', fontSize: '14px' }}>{error}</div>}
          <button style={{ background: loading ? '#3a2020' : '#e8320a', color: '#fff', border: 'none', borderRadius: '8px', padding: '14px', fontSize: '16px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer' }} type='submit' disabled={loading}>{loading ? 'Accesso...' : 'Accedi 🌶️'}</button>
        </form>
        <p style={{ textAlign: 'center', color: '#9a7a72', fontSize: '14px', marginTop: '24px' }}>Non hai un account? <a href='/register' style={{ color: '#e8320a', textDecoration: 'none', fontWeight: '600' }}>Registrati</a></p>
      </div>
    </div>
  )
}
