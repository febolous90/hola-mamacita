import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabaseClient'
import Layout from '../../components/Layout'

const DAYS = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato']

const DEFAULT_SLOTS = DAYS.map((_, i) => ({
  day_of_week: i,
  start_time: '09:00',
  end_time: '21:00',
  is_available: i !== 0,
}))

export default function AvailabilityPage() {
  const router = useRouter()
  const [profile, setProfile] = useState(null)
  const [slots, setSlots] = useState(DEFAULT_SLOTS)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
      supabase.from('profiles').select('*').eq('id', session.user.id).single()
        .then(({ data }) => {
          setProfile(data)
          loadAvailability(data.id)
        })
    })
  }, [])

  const loadAvailability = async (profileId) => {
    const { data } = await supabase
      .from('availability')
      .select('*')
      .eq('profile_id', profileId)
      .order('day_of_week', { ascending: true })

    if (data && data.length > 0) {
      const merged = DEFAULT_SLOTS.map(def => {
        const existing = data.find(d => d.day_of_week === def.day_of_week)
        return existing || def
      })
      setSlots(merged)
    }
  }

  const handleToggle = (dayIndex) => {
    setSlots(slots.map(s =>
      s.day_of_week === dayIndex ? { ...s, is_available: !s.is_available } : s
    ))
  }

  const handleTime = (dayIndex, field, value) => {
    setSlots(slots.map(s =>
      s.day_of_week === dayIndex ? { ...s, [field]: value } : s
    ))
  }

  const handleSave = async () => {
    setLoading(true)
    setSaved(false)

    // Elimina tutto e reinserisce
    await supabase.from('availability').delete().eq('profile_id', profile.id)

    const toInsert = slots.map(s => ({
      profile_id: profile.id,
      day_of_week: s.day_of_week,
      start_time: s.start_time,
      end_time: s.end_time,
      is_available: s.is_available,
    }))

    await supabase.from('availability').insert(toInsert)

    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    setLoading(false)
  }

  if (!profile) return (
    <div style={{ color: '#f5e6e0', background: '#0f0a0a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia, serif' }}>
      Caricamento...
    </div>
  )

  return (
    <Layout profile={profile}>
      <h1 style={s.title}>Disponibilità 📅</h1>
      <p style={s.sub}>Imposta i tuoi orari settimanali</p>

      <div style={s.grid}>
        {slots.map(slot => (
          <div key={slot.day_of_week} style={{ ...s.dayCard, opacity: slot.is_available ? 1 : 0.5 }}>
            <div style={s.dayHeader}>
              <span style={s.dayName}>{DAYS[slot.day_of_week]}</span>
              <button
                onClick={() => handleToggle(slot.day_of_week)}
                style={{ ...s.toggle, background: slot.is_available ? '#e8320a' : '#3a2020' }}
              >
                {slot.is_available ? 'ON' : 'OFF'}
              </button>
            </div>
            {slot.is_available && (
              <div style={s.times}>
                <div style={s.timeField}>
                  <label style={s.label}>Dalle</label>
                  <input
                    type="time"
                    style={s.timeInput}
                    value={slot.start_time}
                    onChange={(e) => handleTime(slot.day_of_week, 'start_time', e.target.value)}
                  />
                </div>
                <div style={s.timeField}>
                  <label style={s.label}>Alle</label>
                  <input
                    type="time"
                    style={s.timeInput}
                    value={slot.end_time}
                    onChange={(e) => handleTime(slot.day_of_week, 'end_time', e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {saved && <div style={s.success}>✅ Disponibilità salvata!</div>}

      <button onClick={handleSave} style={loading ? s.btnDisabled : s.btn} disabled={loading}>
        {loading ? 'Salvataggio...' : 'Salva disponibilità 🌶️'}
      </button>
    </Layout>
  )
}

const s = {
  title: { fontSize: '28px', color: '#f5e6e0', margin: '0 0 8px' },
  sub: { color: '#9a7a72', margin: '0 0 32px', fontSize: '14px' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '12px',
    marginBottom: '24px',
  },
  dayCard: {
    background: '#1a1010', border: '1px solid #3a2020',
    borderRadius: '12px', padding: '16px',
  },
  dayHeader: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: '12px',
  },
  dayName: { fontSize: '15px', fontWeight: '700', color: '#f5e6e0' },
  toggle: {
    border: 'none', borderRadius: '6px', padding: '4px 12px',
    fontSize: '12px', fontWeight: '700', cursor: 'pointer',
    color: '#fff', fontFamily: 'monospace', letterSpacing: '0.05em',
  },
  times: { display: 'flex', gap: '12px' },
  timeField: { display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 },
  label: { fontSize: '11px', color: '#9a7a72', fontFamily: 'monospace', textTransform: 'uppercase' },
  timeInput: {
    background: '#120c0c', border: '1px solid #3a2020',
    borderRadius: '6px', padding: '8px',
    color: '#f5e6e0', fontSize: '14px', outline: 'none',
    fontFamily: 'Georgia, serif', width: '100%',
  },
  success: {
    background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
    color: '#10b981', borderRadius: '8px', padding: '12px',
    fontSize: '14px', marginBottom: '16px',
  },
  btn: {
    background: '#e8320a', color: '#fff', border: 'none',
    borderRadius: '8px', padding: '14px 32px', fontSize: '16px',
    fontWeight: '700', cursor: 'pointer', fontFamily: 'Georgia, serif',
  },
  btnDisabled: {
    background: '#3a2020', color: '#9a7a72', border: 'none',
    borderRadius: '8px', padding: '14px 32px', fontSize: '16px',
    fontWeight: '700', cursor: 'not-allowed', fontFamily: 'Georgia, serif',
  },
}
