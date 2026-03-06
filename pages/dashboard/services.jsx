import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabaseClient'
import Layout from '../../components/Layout'

export default function ServicesPage() {
  const router = useRouter()
  const [profile, setProfile] = useState(null)
  const [services, setServices] = useState([])
  const [form, setForm] = useState({ name: '', description: '', price: '', duration_minutes: '' })
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
      supabase.from('profiles').select('*').eq('id', session.user.id).single()
        .then(({ data }) => {
          setProfile(data)
          loadServices(data.id)
        })
    })
  }, [])

  const loadServices = async (profileId) => {
    const { data } = await supabase
      .from('services')
      .select('*')
      .eq('profile_id', profileId)
      .order('sort_order', { ascending: true })
    setServices(data || [])
  }

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!form.name) { setError('Il nome del servizio è obbligatorio.'); return }
    setLoading(true)
    setError('')

    const { error: insertError } = await supabase.from('services').insert({
      profile_id: profile.id,
      name: form.name,
      description: form.description,
      price: form.price ? parseFloat(form.price) : null,
      duration_minutes: form.duration_minutes ? parseInt(form.duration_minutes) : null,
      sort_order: services.length,
    })

    if (insertError) {
      setError('Errore nel salvataggio. Riprova.')
    } else {
      setForm({ name: '', description: '', price: '', duration_minutes: '' })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      loadServices(profile.id)
    }
    setLoading(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Eliminare questo servizio?')) return
    await supabase.from('services').delete().eq('id', id)
    loadServices(profile.id)
  }

  const handleToggle = async (service) => {
    await supabase.from('services').update({ is_active: !service.is_active }).eq('id', service.id)
    loadServices(profile.id)
  }

  if (!profile) return (
    <div style={{ color: '#f5e6e0', background: '#0f0a0a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia, serif' }}>
      Caricamento...
    </div>
  )

  return (
    <Layout profile={profile}>
      <h1 style={s.title}>Servizi & Prezzi 💼</h1>
      <p style={s.sub}>Aggiungi i servizi che offri con i relativi prezzi</p>

      {/* LISTA SERVIZI */}
      {services.length > 0 && (
        <div style={s.serviceList}>
          {services.map(service => (
            <div key={service.id} style={{ ...s.serviceCard, opacity: service.is_active ? 1 : 0.5 }}>
              <div style={s.serviceInfo}>
                <div style={s.serviceName}>{service.name}</div>
                {service.description && <div style={s.serviceDesc}>{service.description}</div>}
                <div style={s.serviceMeta}>
                  {service.price && <span style={s.badge}>💶 €{service.price}</span>}
                  {service.duration_minutes && <span style={s.badge}>⏱ {service.duration_minutes} min</span>}
                  <span style={{ ...s.badge, color: service.is_active ? '#10b981' : '#9a7a72' }}>
                    {service.is_active ? '● Attivo' : '○ Nascosto'}
                  </span>
                </div>
              </div>
              <div style={s.serviceActions}>
                <button onClick={() => handleToggle(service)} style={s.actionBtn}>
                  {service.is_active ? 'Nascondi' : 'Attiva'}
                </button>
                <button onClick={() => handleDelete(service.id)} style={s.deleteBtn}>
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FORM AGGIUNGI */}
      <div style={s.section}>
        <div style={s.sectionTitle}>+ Aggiungi servizio</div>
        <form onSubmit={handleAdd} style={s.form}>
          <div style={s.field}>
            <label style={s.label}>Nome servizio *</label>
            <input style={s.input} name="name" value={form.name} onChange={handle} placeholder="Es. Massaggio rilassante" />
          </div>
          <div style={s.field}>
            <label style={s.label}>Descrizione</label>
            <textarea style={s.textarea} name="description" value={form.description} onChange={handle} placeholder="Descrivi brevemente il servizio..." rows={3} />
          </div>
          <div style={s.grid2}>
            <div style={s.field}>
              <label style={s.label}>Prezzo (€)</label>
              <input style={s.input} name="price" type="number" value={form.price} onChange={handle} placeholder="Es. 100" min="0" step="0.01" />
            </div>
            <div style={s.field}>
              <label style={s.label}>Durata (minuti)</label>
              <input style={s.input} name="duration_minutes" type="number" value={form.duration_minutes} onChange={handle} placeholder="Es. 60" min="0" />
            </div>
          </div>

          {error && <div style={s.error}>{error}</div>}
          {saved && <div style={s.success}>✅ Servizio aggiunto!</div>}

          <button type="submit" style={loading ? s.btnDisabled : s.btn} disabled={loading}>
            {loading ? 'Salvataggio...' : 'Aggiungi servizio 🌶️'}
          </button>
        </form>
      </div>
    </Layout>
  )
}

const s = {
  title: { fontSize: '28px', color: '#f5e6e0', margin: '0 0 8px' },
  sub: { color: '#9a7a72', margin: '0 0 32px', fontSize: '14px' },
  serviceList: { display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' },
  serviceCard: {
    background: '#1a1010', border: '1px solid #3a2020',
    borderRadius: '12px', padding: '20px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px',
  },
  serviceInfo: { flex: 1 },
  serviceName: { fontSize: '16px', fontWeight: '700', color: '#f5e6e0', marginBottom: '4px' },
  serviceDesc: { fontSize: '13px', color: '#9a7a72', marginBottom: '8px' },
  serviceMeta: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  badge: {
    fontSize: '12px', color: '#9a7a72', fontFamily: 'monospace',
    background: '#120c0c', border: '1px solid #3a2020',
    borderRadius: '4px', padding: '2px 8px',
  },
  serviceActions: { display: 'flex', gap: '8px', flexShrink: 0 },
  actionBtn: {
    background: '#2a1010', border: '1px solid #3a2020', color: '#f5e6e0',
    borderRadius: '6px', padding: '6px 12px', fontSize: '13px',
    cursor: 'pointer', fontFamily: 'Georgia, serif',
  },
  deleteBtn: {
    background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.2)',
    color: '#ff4444', borderRadius: '6px', padding: '6px 10px',
    fontSize: '13px', cursor: 'pointer',
  },
  section: {
    background: '#1a1010', border: '1px solid #3a2020',
    borderRadius: '12px', padding: '24px',
  },
  sectionTitle: { fontSize: '16px', fontWeight: '700', color: '#f5e6e0', marginBottom: '20px' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '12px', color: '#9a7a72', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.05em' },
  input: {
    background: '#120c0c', border: '1px solid #3a2020',
    borderRadius: '8px', padding: '10px 12px',
    color: '#f5e6e0', fontSize: '14px', outline: 'none', fontFamily: 'Georgia, serif',
  },
  textarea: {
    background: '#120c0c', border: '1px solid #3a2020',
    borderRadius: '8px', padding: '10px 12px',
    color: '#f5e6e0', fontSize: '14px', outline: 'none',
    fontFamily: 'Georgia, serif', resize: 'vertical',
  },
  error: {
    background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.3)',
    color: '#ff4444', borderRadius: '8px', padding: '12px', fontSize: '14px',
  },
  success: {
    background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
    color: '#10b981', borderRadius: '8px', padding: '12px', fontSize: '14px',
  },
  btn: {
    background: '#e8320a', color: '#fff', border: 'none',
    borderRadius: '8px', padding: '14px', fontSize: '16px',
    fontWeight: '700', cursor: 'pointer', fontFamily: 'Georgia, serif',
  },
  btnDisabled: {
    background: '#3a2020', color: '#9a7a72', border: 'none',
    borderRadius: '8px', padding: '14px', fontSize: '16px',
    fontWeight: '700', cursor: 'not-allowed', fontFamily: 'Georgia, serif',
  },
}
