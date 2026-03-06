import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabaseClient'
import Layout from '../../components/Layout'

export default function Dashboard() {
  const router = useRouter()
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
      supabase.from('profiles').select('*').eq('id', session.user.id).single()
        .then(({ data }) => setProfile(data))
    })
  }, [])

  if (!profile) return (
    <div style={{ color: '#f5e6e0', background: '#0f0a0a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia, serif', fontSize: '18px' }}>
      Caricamento...
    </div>
  )

  return (
    <Layout profile={profile}>
      <h1 style={{ fontSize: '28px', color: '#f5e6e0', margin: '0 0 8px' }}>
        Ciao, {profile.display_name || profile.username}! 🌶️
      </h1>
      <p style={{ color: '#9a7a72', marginBottom: '40px' }}>Benvenuta nella tua dashboard</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', maxWidth: '600px' }}>
        <div style={{ background: '#1a1010', border: '1px solid #3a2020', borderRadius: '12px', padding: '24px' }}>
          <p style={{ margin: '0 0 8px', color: '#9a7a72', fontSize: '12px', fontFamily: 'monospace', textTransform: 'uppercase' }}>Status profilo</p>
          <p style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: profile.status === 'approved' ? '#10b981' : profile.status === 'pending' ? '#f59e0b' : '#ef4444', textTransform: 'uppercase' }}>{profile.status}</p>
        </div>
        <div style={{ background: '#1a1010', border: '1px solid #3a2020', borderRadius: '12px', padding: '24px' }}>
          <p style={{ margin: '0 0 8px', color: '#9a7a72', fontSize: '12px', fontFamily: 'monospace', textTransform: 'uppercase' }}>Visualizzazioni</p>
          <p style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#f5e6e0' }}>{profile.view_count || 0}</p>
        </div>
      </div>

      {profile.status === 'pending' && (
        <div style={{ marginTop: '32px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '12px', padding: '20px', maxWidth: '600px' }}>
          <p style={{ margin: 0, color: '#f59e0b', fontSize: '14px' }}>
            ⏳ Il tuo profilo è in attesa di approvazione. Completa il profilo mentre aspetti!
          </p>
        </div>
      )}

      <div style={{ marginTop: '32px' }}>
        <a href="/dashboard/profile" style={{ background: '#e8320a', color: '#fff', textDecoration: 'none', borderRadius: '8px', padding: '12px 24px', fontSize: '15px', fontWeight: '700', fontFamily: 'Georgia, serif' }}>
          Completa il profilo →
        </a>
      </div>
    </Layout>
  )
}
