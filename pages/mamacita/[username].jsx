import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabaseClient'

export default function PublicProfile() {
  const router = useRouter()
  const { username } = router.query
  const [profile, setProfile] = useState(null)
  const [services, setServices] = useState([])
  const [posts, setPosts] = useState([])
  const [availability, setAvailability] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const DAYS = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab']

  useEffect(() => {
    if (!username) return
    loadProfile()
  }, [username])

  const loadProfile = async () => {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .eq('status', 'approved')
      .single()

    if (!profileData) { setNotFound(true); setLoading(false); return }

    setProfile(profileData)

    // Incrementa view count
    await supabase.from('profiles').update({ view_count: (profileData.view_count || 0) + 1 }).eq('id', profileData.id)

    // Carica servizi, post, disponibilità in parallelo
    const [{ data: servicesData }, { data: postsData }, { data: availData }] = await Promise.all([
      supabase.from('services').select('*').eq('profile_id', profileData.id).eq('is_active', true).order('sort_order'),
      supabase.from('posts').select('*').eq('profile_id', profileData.id).eq('is_visible', true).order('is_pinned', { ascending: false }).order('created_at', { ascending: false }).limit(10),
      supabase.from('availability').select('*').eq('profile_id', profileData.id).eq('is_available', true).order('day_of_week'),
    ])

    setServices(servicesData || [])
    setPosts(postsData || [])
    setAvailability(availData || [])
    setLoading(false)
  }

  const formatDate = (d) => new Date(d).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })

  if (loading) return (
    <div style={{ color: '#f5e6e0', background: '#0f0a0a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia, serif', fontSize: '18px' }}>
      Caricamento...
    </div>
  )

  if (notFound) return (
    <div style={{ color: '#f5e6e0', background: '#0f0a0a', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia, serif' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>🌶️</div>
      <h1 style={{ fontSize: '24px', marginBottom: '8px' }}>Profilo non trovato</h1>
      <p style={{ color: '#9a7a72' }}>Questo profilo non esiste o non è ancora approvato.</p>
    </div>
  )

  return (
    <div style={s.page}>
      {/* HERO */}
      <div style={s.hero}>
        {profile.cover_url && (
          <div style={{ ...s.cover, backgroundImage: `url(${profile.cover_url})` }} />
        )}
        <div style={s.heroContent}>
          <div style={s.avatar}>
            {profile.avatar_url
              ? <img src={profile.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={s.avatarInitial}>{(profile.display_name || profile.username)[0].toUpperCase()}</span>
            }
          </div>
          <div style={s.heroInfo}>
            <h1 style={s.name}>{profile.display_name || profile.username}</h1>
            <div style={s.meta}>
              {profile.age && <span style={s.metaTag}>🎂 {profile.age} anni</span>}
              {profile.location && <span style={s.metaTag}>📍 {profile.location}</span>}
            </div>
            {profile.bio && <p style={s.bio}>{profile.bio}</p>}
          </div>
        </div>
      </div>

      <div style={s.body}>
        <div style={s.main}>

          {/* POST */}
          {posts.length > 0 && (
            <div style={s.section}>
              <div style={s.sectionTitle}>📸 Aggiornamenti</div>
              <div style={s.postList}>
                {posts.map(post => (
                  <div key={post.id} style={s.postCard}>
                    {post.is_pinned && <span style={s.pinBadge}>📌 In evidenza</span>}
                    <p style={s.postContent}>{post.content}</p>
                    <span style={s.postDate}>{formatDate(post.created_at)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SERVIZI */}
          {services.length > 0 && (
            <div style={s.section}>
              <div style={s.sectionTitle}>💼 Servizi & Prezzi</div>
              <div style={s.serviceList}>
                {services.map(service => (
                  <div key={service.id} style={s.serviceCard}>
                    <div style={s.serviceInfo}>
                      <div style={s.serviceName}>{service.name}</div>
                      {service.description && <div style={s.serviceDesc}>{service.description}</div>}
                    </div>
                    <div style={s.servicePricing}>
                      {service.price && <div style={s.price}>€{service.price}</div>}
                      {service.duration_minutes && <div style={s.duration}>{service.duration_minutes} min</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DISPONIBILITÀ */}
          {availability.length > 0 && (
            <div style={s.section}>
              <div style={s.sectionTitle}>📅 Disponibilità</div>
              <div style={s.availGrid}>
                {availability.map(slot => (
                  <div key={slot.id} style={s.availCard}>
                    <div style={s.availDay}>{DAYS[slot.day_of_week]}</div>
                    <div style={s.availTime}>{slot.start_time.slice(0,5)} – {slot.end_time.slice(0,5)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* SIDEBAR CONTATTI */}
        <div style={s.sidebar}>
          <div style={s.contactCard}>
            <div style={s.contactTitle}>📞 Contatti</div>
            {profile.whatsapp && (
              <a href={`https://wa.me/${profile.whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer" style={s.contactBtn}>
                💬 WhatsApp
              </a>
            )}
            {profile.telegram && (
              <a href={`https://t.me/${profile.telegram.replace('@','')}`} target="_blank" rel="noopener noreferrer" style={s.contactBtn}>
                ✈️ Telegram
              </a>
            )}
            {profile.phone && (
              <a href={`tel:${profile.phone}`} style={s.contactBtn}>
                📱 Chiama
              </a>
            )}
            {profile.website && (
              <a href={profile.website} target="_blank" rel="noopener noreferrer" style={s.contactBtnSecondary}>
                🌐 Sito web
              </a>
            )}
            {!profile.whatsapp && !profile.telegram && !profile.phone && (
              <p style={{ color: '#9a7a72', fontSize: '14px', margin: 0 }}>Nessun contatto disponibile</p>
            )}
          </div>
        </div>
      </div>

      <div style={s.footer}>
        <span style={s.footerLogo}>🌶️ Hola Mamacita</span>
        <a href="/register" style={s.footerLink}>Sei una Mamacita? Registrati</a>
      </div>
    </div>
  )
}

const s = {
  page: { minHeight: '100vh', background: '#0f0a0a', fontFamily: 'Georgia, serif', color: '#f5e6e0' },
  hero: { background: '#1a1010', borderBottom: '1px solid #3a2020', padding: '48px', position: 'relative' },
  cover: { position: 'absolute', top: 0, left: 0, right: 0, height: '200px', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.3 },
  heroContent: { display: 'flex', gap: '32px', alignItems: 'flex-start', position: 'relative', zIndex: 1, maxWidth: '900px' },
  avatar: {
    width: '120px', height: '120px', borderRadius: '50%', overflow: 'hidden',
    border: '3px solid #e8320a', flexShrink: 0,
    background: '#3a2020', display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  avatarInitial: { color: '#e8320a', fontWeight: 'bold', fontSize: '48px' },
  heroInfo: { flex: 1, paddingTop: '8px' },
  name: { fontSize: '36px', margin: '0 0 12px', color: '#f5e6e0' },
  meta: { display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' },
  metaTag: {
    fontSize: '14px', color: '#9a7a72', background: '#120c0c',
    border: '1px solid #3a2020', borderRadius: '20px', padding: '4px 12px',
  },
  bio: { color: '#c4a99e', fontSize: '16px', lineHeight: '1.7', margin: 0, maxWidth: '600px' },
  body: { display: 'flex', gap: '32px', padding: '48px', maxWidth: '1100px', alignItems: 'flex-start' },
  main: { flex: 1, display: 'flex', flexDirection: 'column', gap: '32px' },
  section: { background: '#1a1010', border: '1px solid #3a2020', borderRadius: '12px', padding: '24px' },
  sectionTitle: { fontSize: '18px', fontWeight: '700', color: '#f5e6e0', marginBottom: '20px' },
  postList: { display: 'flex', flexDirection: 'column', gap: '16px' },
  postCard: { borderBottom: '1px solid #3a2020', paddingBottom: '16px' },
  pinBadge: { fontSize: '12px', color: '#f59e0b', fontFamily: 'monospace', display: 'block', marginBottom: '6px' },
  postContent: { color: '#c4a99e', fontSize: '15px', lineHeight: '1.6', margin: '0 0 8px' },
  postDate: { fontSize: '12px', color: '#9a7a72', fontFamily: 'monospace' },
  serviceList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  serviceCard: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    background: '#120c0c', borderRadius: '8px', padding: '16px', gap: '16px',
  },
  serviceInfo: { flex: 1 },
  serviceName: { fontSize: '15px', fontWeight: '700', color: '#f5e6e0', marginBottom: '4px' },
  serviceDesc: { fontSize: '13px', color: '#9a7a72' },
  servicePricing: { textAlign: 'right', flexShrink: 0 },
  price: { fontSize: '20px', fontWeight: '700', color: '#e8320a' },
  duration: { fontSize: '12px', color: '#9a7a72', fontFamily: 'monospace' },
  availGrid: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  availCard: {
    background: '#120c0c', border: '1px solid #3a2020',
    borderRadius: '8px', padding: '12px 16px', textAlign: 'center',
  },
  availDay: { fontSize: '13px', fontWeight: '700', color: '#e8320a', fontFamily: 'monospace', textTransform: 'uppercase' },
  availTime: { fontSize: '12px', color: '#9a7a72', marginTop: '4px', fontFamily: 'monospace' },
  sidebar: { width: '280px', flexShrink: 0, position: 'sticky', top: '24px' },
  contactCard: {
    background: '#1a1010', border: '1px solid #3a2020',
    borderRadius: '12px', padding: '24px',
    display: 'flex', flexDirection: 'column', gap: '12px',
  },
  contactTitle: { fontSize: '16px', fontWeight: '700', color: '#f5e6e0', marginBottom: '4px' },
  contactBtn: {
    display: 'block', background: '#e8320a', color: '#fff',
    textDecoration: 'none', borderRadius: '8px', padding: '12px 16px',
    fontSize: '15px', fontWeight: '700', textAlign: 'center',
  },
  contactBtnSecondary: {
    display: 'block', background: '#2a1010', border: '1px solid #3a2020',
    color: '#f5e6e0', textDecoration: 'none', borderRadius: '8px',
    padding: '12px 16px', fontSize: '15px', textAlign: 'center',
  },
  footer: {
    borderTop: '1px solid #3a2020', padding: '24px 48px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  footerLogo: { color: '#e8320a', fontWeight: 'bold', fontSize: '16px' },
  footerLink: { color: '#9a7a72', fontSize: '14px', textDecoration: 'none' },
}
