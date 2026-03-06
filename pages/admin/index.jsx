import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabaseClient'

export default function AdminIndex() {
  const router = useRouter()
  const [profiles, setProfiles] = useState([])
  const [filter, setFilter] = useState('pending')
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/login'); return }

      // Controlla se è admin
      const { data: adminData } = await supabase
        .from('admin_users')
        .select('user_id')
        .eq('user_id', session.user.id)
        .single()

      if (!adminData) { router.push('/dashboard'); return }
      setIsAdmin(true)
      loadProfiles('pending')
    })
  }, [])

  const loadProfiles = async (status) => {
    setLoading(true)
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })
    setProfiles(data || [])
    setLoading(false)
  }

  const handleFilter = (status) => {
    setFilter(status)
    loadProfiles(status)
  }

  const handleAction = async (profileId, action) => {
    const { data: { session } } = await supabase.auth.getSession()

    await supabase.from('profiles').update({ status: action }).eq('id', profileId)
    await supabase.from('admin_reviews').insert({
      profile_id: profileId,
      admin_id: session.user.id,
      action,
    })
    loadProfiles(filter)
  }

  const formatDate = (d) => new Date(d).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })

  const statusColor = { pending: '#f59e0b', approved: '#10b981', rejected: '#ef4444', suspended: '#6b7280' }

  if (!isAdmin) return null

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div style={s.logo}>🌶️ Mamacita Admin</div>
        <button onClick={() => { supabase.auth.signOut(); router.push('/login') }} style={s.logoutBtn}>↩ Esci</button>
      </div>

      <div style={s.content}>
        <h1 style={s.title}>Panel Admin</h1>
        <p style={s.sub}>Gestisci i profili delle Mamacitas</p>

        {/* FILTRI */}
        <div style={s.filters}>
          {['pending', 'approved', 'rejected', 'suspended'].map(status => (
            <button
              key={status}
              onClick={() => handleFilter(status)}
              style={{ ...s.filterBtn, ...(filter === status ? s.filterBtnActive : {}) }}
            >
              <span style={{ color: statusColor[status] }}>●</span> {status}
            </button>
          ))}
        </div>

        {/* LISTA */}
        {loading ? (
          <div style={s.empty}>Caricamento...</div>
        ) : profiles.length === 0 ? (
          <div style={s.empty}>Nessun profilo con status "{filter}"</div>
        ) : (
          <div style={s.list}>
            {profiles.map(profile => (
              <div key={profile.id} style={s.card}>
                <div style={s.cardLeft}>
                  <div style={s.avatar}>
                    {profile.avatar_url
                      ? <img src={profile.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <span style={s.avatarInitial}>{(profile.display_name || profile.username || '?')[0].toUpperCase()}</span>
                    }
                  </div>
                  <div>
                    <div style={s.profileName}>{profile.display_name || '—'}</div>
                    <div style={s.profileUsername}>@{profile.username}</div>
                    <div style={s.profileMeta}>
                      {profile.location && <span>📍 {profile.location}</span>}
                      {profile.age && <span>🎂 {profile.age} anni</span>}
                      <span>📅 {formatDate(profile.created_at)}</span>
                    </div>
                    {profile.bio && <div style={s.profileBio}>{profile.bio.slice(0, 120)}{profile.bio.length > 120 ? '...' : ''}</div>}
                  </div>
                </div>
                <div style={s.cardActions}>
                  <button onClick={() => router.push(`/admin/profile?id=${profile.id}`)} style={s.viewBtn}>
                    👁 Vedi tutto
                  </button>
                  {filter !== 'approved' && (
                    <button onClick={() => handleAction(profile.id, 'approved')} style={s.approveBtn}>
                      ✓ Approva
                    </button>
                  )}
                  {filter !== 'rejected' && (
                    <button onClick={() => handleAction(profile.id, 'rejected')} style={s.rejectBtn}>
                      ✕ Rifiuta
                    </button>
                  )}
                  {filter !== 'suspended' && filter === 'approved' && (
                    <button onClick={() => handleAction(profile.id, 'suspended')} style={s.suspendBtn}>
                      ⏸ Sospendi
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const s = {
  page: { minHeight: '100vh', background: '#0f0a0a', fontFamily: 'Georgia, serif', color: '#f5e6e0' },
  header: {
    background: '#1a1010', borderBottom: '1px solid #3a2020',
    padding: '16px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  logo: { fontSize: '18px', fontWeight: 'bold', color: '#e8320a' },
  logoutBtn: {
    background: 'transparent', border: '1px solid #3a2020', color: '#9a7a72',
    borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', fontFamily: 'Georgia, serif',
  },
  content: { padding: '48px', maxWidth: '1000px' },
  title: { fontSize: '28px', color: '#f5e6e0', margin: '0 0 8px' },
  sub: { color: '#9a7a72', margin: '0 0 32px', fontSize: '14px' },
  filters: { display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' },
  filterBtn: {
    background: '#1a1010', border: '1px solid #3a2020', color: '#9a7a72',
    borderRadius: '8px', padding: '8px 16px', cursor: 'pointer',
    fontFamily: 'Georgia, serif', fontSize: '14px', textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  filterBtnActive: { background: '#2a1010', color: '#f5e6e0', borderColor: '#e8320a' },
  empty: {
    background: '#1a1010', border: '1px solid #3a2020', borderRadius: '12px',
    padding: '48px', textAlign: 'center', color: '#9a7a72',
  },
  list: { display: 'flex', flexDirection: 'column', gap: '12px' },
  card: {
    background: '#1a1010', border: '1px solid #3a2020', borderRadius: '12px',
    padding: '20px', display: 'flex', alignItems: 'flex-start',
    justifyContent: 'space-between', gap: '24px',
  },
  cardLeft: { display: 'flex', gap: '16px', flex: 1 },
  avatar: {
    width: '56px', height: '56px', borderRadius: '50%', overflow: 'hidden',
    background: '#3a2020', flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  avatarInitial: { color: '#e8320a', fontWeight: 'bold', fontSize: '20px' },
  profileName: { fontSize: '16px', fontWeight: '700', color: '#f5e6e0' },
  profileUsername: { fontSize: '13px', color: '#e8320a', fontFamily: 'monospace', margin: '2px 0 6px' },
  profileMeta: { display: 'flex', gap: '12px', fontSize: '12px', color: '#9a7a72', flexWrap: 'wrap', marginBottom: '6px' },
  profileBio: { fontSize: '13px', color: '#9a7a72', lineHeight: '1.5', maxWidth: '500px' },
  cardActions: { display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 },
  viewBtn: {
    background: '#2a1010', border: '1px solid #3a2020', color: '#f5e6e0',
    borderRadius: '6px', padding: '8px 14px', cursor: 'pointer',
    fontFamily: 'Georgia, serif', fontSize: '13px', whiteSpace: 'nowrap',
  },
  approveBtn: {
    background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)',
    color: '#10b981', borderRadius: '6px', padding: '8px 14px',
    cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '13px', whiteSpace: 'nowrap',
  },
  rejectBtn: {
    background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.2)',
    color: '#ff4444', borderRadius: '6px', padding: '8px 14px',
    cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '13px', whiteSpace: 'nowrap',
  },
  suspendBtn: {
    background: 'rgba(107,114,128,0.15)', border: '1px solid rgba(107,114,128,0.3)',
    color: '#6b7280', borderRadius: '6px', padding: '8px 14px',
    cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '13px', whiteSpace: 'nowrap',
  },
}
