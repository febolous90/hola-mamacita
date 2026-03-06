import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabaseClient'
import Layout from '../../components/Layout'

export default function PostsPage() {
  const router = useRouter()
  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
      supabase.from('profiles').select('*').eq('id', session.user.id).single()
        .then(({ data }) => {
          setProfile(data)
          loadPosts(data.id)
        })
    })
  }, [])

  const loadPosts = async (profileId) => {
    const { data } = await supabase
      .from('posts')
      .select('*')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false })
    setPosts(data || [])
  }

  const handlePost = async (e) => {
    e.preventDefault()
    if (!content.trim()) { setError('Scrivi qualcosa prima di pubblicare.'); return }
    if (content.length > 500) { setError('Massimo 500 caratteri.'); return }
    setLoading(true)
    setError('')

    const { error: insertError } = await supabase.from('posts').insert({
      profile_id: profile.id,
      content: content.trim(),
    })

    if (insertError) {
      setError('Errore nella pubblicazione. Riprova.')
    } else {
      setContent('')
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      loadPosts(profile.id)
    }
    setLoading(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Eliminare questo post?')) return
    await supabase.from('posts').delete().eq('id', id)
    loadPosts(profile.id)
  }

  const handleTogglePin = async (post) => {
    await supabase.from('posts').update({ is_pinned: !post.is_pinned }).eq('id', post.id)
    loadPosts(profile.id)
  }

  const handleToggleVisible = async (post) => {
    await supabase.from('posts').update({ is_visible: !post.is_visible }).eq('id', post.id)
    loadPosts(profile.id)
  }

  const formatDate = (dateStr) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  if (!profile) return (
    <div style={{ color: '#f5e6e0', background: '#0f0a0a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia, serif' }}>
      Caricamento...
    </div>
  )

  return (
    <Layout profile={profile}>
      <h1 style={s.title}>Contenuti 📸</h1>
      <p style={s.sub}>Pubblica aggiornamenti, annunci e contenuti per i tuoi clienti</p>

      {/* COMPOSER */}
      <div style={s.composer}>
        <div style={s.composerHeader}>
          <div style={s.composerAvatar}>
            {profile.avatar_url
              ? <img src={profile.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ color: '#e8320a', fontWeight: 'bold' }}>{(profile.display_name || profile.username || '?')[0].toUpperCase()}</span>
            }
          </div>
          <span style={s.composerName}>{profile.display_name || profile.username}</span>
        </div>
        <form onSubmit={handlePost}>
          <textarea
            style={s.textarea}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Scrivi un aggiornamento per i tuoi clienti..."
            rows={4}
            maxLength={500}
          />
          <div style={s.composerFooter}>
            <span style={{ ...s.charCount, color: content.length > 450 ? '#f59e0b' : '#9a7a72' }}>
              {content.length}/500
            </span>
            {error && <span style={s.errorInline}>{error}</span>}
            {saved && <span style={s.successInline}>✅ Pubblicato!</span>}
            <button type="submit" style={loading ? s.btnDisabled : s.btn} disabled={loading}>
              {loading ? 'Pubblicazione...' : 'Pubblica 🌶️'}
            </button>
          </div>
        </form>
      </div>

      {/* LISTA POST */}
      {posts.length === 0 ? (
        <div style={s.empty}>
          <p>Nessun contenuto ancora. Pubblica il tuo primo post! 👆</p>
        </div>
      ) : (
        <div style={s.postList}>
          {posts.map(post => (
            <div key={post.id} style={{ ...s.postCard, opacity: post.is_visible ? 1 : 0.5 }}>
              <div style={s.postMeta}>
                <div style={s.postBadges}>
                  {post.is_pinned && <span style={s.pinBadge}>📌 In evidenza</span>}
                  {!post.is_visible && <span style={s.hiddenBadge}>👁 Nascosto</span>}
                </div>
                <span style={s.postDate}>{formatDate(post.created_at)}</span>
              </div>
              <p style={s.postContent}>{post.content}</p>
              <div style={s.postActions}>
                <button onClick={() => handleTogglePin(post)} style={s.actionBtn}>
                  {post.is_pinned ? '📌 Rimuovi pin' : '📌 Metti in evidenza'}
                </button>
                <button onClick={() => handleToggleVisible(post)} style={s.actionBtn}>
                  {post.is_visible ? '👁 Nascondi' : '👁 Mostra'}
                </button>
                <button onClick={() => handleDelete(post.id)} style={s.deleteBtn}>
                  ✕ Elimina
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  )
}

const s = {
  title: { fontSize: '28px', color: '#f5e6e0', margin: '0 0 8px' },
  sub: { color: '#9a7a72', margin: '0 0 32px', fontSize: '14px' },
  composer: {
    background: '#1a1010', border: '1px solid #3a2020',
    borderRadius: '12px', padding: '24px', marginBottom: '32px',
  },
  composerHeader: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' },
  composerAvatar: {
    width: '40px', height: '40px', borderRadius: '50%',
    background: '#3a2020', overflow: 'hidden', flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  composerName: { fontSize: '15px', fontWeight: '700', color: '#f5e6e0' },
  textarea: {
    width: '100%', background: '#120c0c', border: '1px solid #3a2020',
    borderRadius: '8px', padding: '12px', color: '#f5e6e0',
    fontSize: '15px', outline: 'none', fontFamily: 'Georgia, serif',
    resize: 'vertical', boxSizing: 'border-box',
  },
  composerFooter: {
    display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
    gap: '12px', marginTop: '12px',
  },
  charCount: { fontSize: '13px', fontFamily: 'monospace' },
  errorInline: { fontSize: '13px', color: '#ff4444' },
  successInline: { fontSize: '13px', color: '#10b981' },
  btn: {
    background: '#e8320a', color: '#fff', border: 'none',
    borderRadius: '8px', padding: '10px 20px', fontSize: '15px',
    fontWeight: '700', cursor: 'pointer', fontFamily: 'Georgia, serif',
  },
  btnDisabled: {
    background: '#3a2020', color: '#9a7a72', border: 'none',
    borderRadius: '8px', padding: '10px 20px', fontSize: '15px',
    fontWeight: '700', cursor: 'not-allowed', fontFamily: 'Georgia, serif',
  },
  empty: {
    background: '#1a1010', border: '1px solid #3a2020',
    borderRadius: '12px', padding: '48px',
    textAlign: 'center', color: '#9a7a72', fontSize: '15px',
  },
  postList: { display: 'flex', flexDirection: 'column', gap: '16px' },
  postCard: {
    background: '#1a1010', border: '1px solid #3a2020',
    borderRadius: '12px', padding: '20px',
  },
  postMeta: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: '12px',
  },
  postBadges: { display: 'flex', gap: '8px' },
  pinBadge: {
    fontSize: '12px', color: '#f59e0b', fontFamily: 'monospace',
    background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)',
    borderRadius: '4px', padding: '2px 8px',
  },
  hiddenBadge: {
    fontSize: '12px', color: '#9a7a72', fontFamily: 'monospace',
    background: '#120c0c', border: '1px solid #3a2020',
    borderRadius: '4px', padding: '2px 8px',
  },
  postDate: { fontSize: '12px', color: '#9a7a72', fontFamily: 'monospace' },
  postContent: { color: '#f5e6e0', fontSize: '15px', lineHeight: '1.6', margin: '0 0 16px' },
  postActions: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  actionBtn: {
    background: '#2a1010', border: '1px solid #3a2020', color: '#9a7a72',
    borderRadius: '6px', padding: '6px 12px', fontSize: '13px',
    cursor: 'pointer', fontFamily: 'Georgia, serif',
  },
  deleteBtn: {
    background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.2)',
    color: '#ff4444', borderRadius: '6px', padding: '6px 12px',
    fontSize: '13px', cursor: 'pointer', fontFamily: 'Georgia, serif',
  },
}
