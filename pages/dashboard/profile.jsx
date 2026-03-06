import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabaseClient'
import Layout from '../../components/Layout'

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [avatarUploading, setAvatarUploading] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
      supabase.from('profiles').select('*').eq('id', session.user.id).single()
        .then(({ data }) => {
          setProfile(data)
          setForm(data)
        })
    })
  }, [])

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSaved(false)

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        display_name: form.display_name,
        bio: form.bio,
        location: form.location,
        age: form.age ? parseInt(form.age) : null,
        phone: form.phone,
        whatsapp: form.whatsapp,
        telegram: form.telegram,
        website: form.website,
      })
      .eq('id', profile.id)

    if (updateError) {
      setError('Errore nel salvataggio. Riprova.')
    } else {
      setSaved(true)
      setProfile({ ...profile, ...form })
      setTimeout(() => setSaved(false), 3000)
    }
    setLoading(false)
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { setError('Immagine troppo grande (max 5MB)'); return }

    setAvatarUploading(true)
    setError('')

    const ext = file.name.split('.').pop()
    const path = `${profile.id}/avatar.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true })

    if (uploadError) {
      setError('Errore upload foto. Riprova.')
      setAvatarUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)

    await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', profile.id)
    setProfile({ ...profile, avatar_url: publicUrl })
    setForm({ ...form, avatar_url: publicUrl })
    setAvatarUploading(false)
  }

  if (!form) return (
    <div style={{ color: '#f5e6e0', background: '#0f0a0a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia, serif' }}>
      Caricamento...
    </div>
  )

  return (
    <Layout profile={profile}>
      <h1 style={s.title}>Il tuo profilo</h1>
      <p style={s.sub}>Le modifiche saranno visibili dopo l'approvazione admin</p>

      {/* AVATAR */}
      <div style={s.avatarSection}>
        <div style={s.avatarWrap}>
          {form.avatar_url
            ? <img src={form.avatar_url} style={s.avatarImg} />
            : <div style={s.avatarPlaceholder}>{(form.display_name || form.username || '?')[0].toUpperCase()}</div>
          }
        </div>
        <div>
          <label style={s.uploadBtn}>
            {avatarUploading ? 'Caricamento...' : '📷 Cambia foto'}
            <input type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} disabled={avatarUploading} />
          </label>
          <p style={s.uploadHint}>JPG, PNG — max 5MB</p>
        </div>
      </div>

      <form onSubmit={handleSave} style={s.form}>

        {/* SEZIONE IDENTITÀ */}
        <div style={s.section}>
          <div style={s.sectionTitle}>✨ Identità</div>
          <div style={s.grid2}>
            <div style={s.field}>
              <label style={s.label}>Nome d'arte</label>
              <input style={s.input} name="display_name" value={form.display_name || ''} onChange={handle} placeholder="Es. Sofia Caliente" />
            </div>
            <div style={s.field}>
              <label style={s.label}>Età</label>
              <input style={s.input} name="age" type="number" value={form.age || ''} onChange={handle} placeholder="Es. 25" min="18" max="99" />
            </div>
          </div>
          <div style={s.field}>
            <label style={s.label}>Città / Zona</label>
            <input style={s.input} name="location" value={form.location || ''} onChange={handle} placeholder="Es. Milano, Centro" />
          </div>
          <div style={s.field}>
            <label style={s.label}>Bio</label>
            <textarea style={s.textarea} name="bio" value={form.bio || ''} onChange={handle} placeholder="Raccontati in poche righe..." rows={4} />
          </div>
        </div>

        {/* SEZIONE CONTATTI */}
        <div style={s.section}>
          <div style={s.sectionTitle}>📱 Contatti</div>
          <div style={s.grid2}>
            <div style={s.field}>
              <label style={s.label}>Telefono</label>
              <input style={s.input} name="phone" value={form.phone || ''} onChange={handle} placeholder="+39 333 000 0000" />
            </div>
            <div style={s.field}>
              <label style={s.label}>WhatsApp</label>
              <input style={s.input} name="whatsapp" value={form.whatsapp || ''} onChange={handle} placeholder="+39 333 000 0000" />
            </div>
            <div style={s.field}>
              <label style={s.label}>Telegram</label>
              <input style={s.input} name="telegram" value={form.telegram || ''} onChange={handle} placeholder="@username" />
            </div>
            <div style={s.field}>
              <label style={s.label}>Sito web</label>
              <input style={s.input} name="website" value={form.website || ''} onChange={handle} placeholder="https://..." />
            </div>
          </div>
        </div>

        {error && <div style={s.error}>{error}</div>}
        {saved && <div style={s.success}>✅ Profilo salvato con successo!</div>}

        <button type="submit" style={loading ? s.btnDisabled : s.btn} disabled={loading}>
          {loading ? 'Salvataggio...' : 'Salva modifiche 🌶️'}
        </button>
      </form>
    </Layout>
  )
}

const s = {
  title: { fontSize: '28px', color: '#f5e6e0', margin: '0 0 8px' },
  sub: { color: '#9a7a72', margin: '0 0 32px', fontSize: '14px' },
  avatarSection: {
    display: 'flex', alignItems: 'center', gap: '24px',
    background: '#1a1010', border: '1px solid #3a2020',
    borderRadius: '12px', padding: '24px', marginBottom: '32px',
  },
  avatarWrap: {
    width: '80px', height: '80px', borderRadius: '50%',
    overflow: 'hidden', flexShrink: 0,
    border: '2px solid #3a2020',
  },
  avatarImg: { width: '100%', height: '100%', objectFit: 'cover' },
  avatarPlaceholder: {
    width: '100%', height: '100%', background: '#3a2020',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#e8320a', fontWeight: 'bold', fontSize: '28px',
  },
  uploadBtn: {
    display: 'inline-block', background: '#2a1010',
    border: '1px solid #3a2020', color: '#f5e6e0',
    borderRadius: '8px', padding: '8px 16px',
    fontSize: '14px', cursor: 'pointer',
  },
  uploadHint: { color: '#9a7a72', fontSize: '12px', margin: '8px 0 0', fontFamily: 'monospace' },
  form: { display: 'flex', flexDirection: 'column', gap: '24px' },
  section: {
    background: '#1a1010', border: '1px solid #3a2020',
    borderRadius: '12px', padding: '24px',
    display: 'flex', flexDirection: 'column', gap: '16px',
  },
  sectionTitle: { fontSize: '16px', fontWeight: '700', color: '#f5e6e0', marginBottom: '4px' },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '12px', color: '#9a7a72', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.05em' },
  input: {
    background: '#120c0c', border: '1px solid #3a2020',
    borderRadius: '8px', padding: '10px 12px',
    color: '#f5e6e0', fontSize: '14px', outline: 'none',
    fontFamily: 'Georgia, serif',
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
