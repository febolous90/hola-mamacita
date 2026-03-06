import Link from 'next/link'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'

export default function Layout({ children, profile }) {
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const navItems = [
    { href: '/dashboard', label: 'Home', icon: '🏠' },
    { href: '/dashboard/profile', label: 'Profilo', icon: '👤' },
    { href: '/dashboard/services', label: 'Servizi', icon: '💼' },
    { href: '/dashboard/availability', label: 'Disponibilità', icon: '📅' },
    { href: '/dashboard/posts', label: 'Contenuti', icon: '📸' },
  ]

  return (
    <div style={s.shell}>
      <aside style={s.sidebar}>
        <div style={s.logo}>🌶️ Mamacita</div>
        {profile && (
          <div style={s.userBox}>
            <div style={s.avatar}>
              {profile.avatar_url
                ? <img src={profile.avatar_url} style={s.avatarImg} />
                : <span style={s.avatarInitial}>{(profile.display_name || profile.username || '?')[0].toUpperCase()}</span>
              }
            </div>
            <div>
              <div style={s.userName}>{profile.display_name || profile.username}</div>
              <div style={s.userStatus(profile.status)}>{profile.status}</div>
            </div>
          </div>
        )}
        <nav style={s.nav}>
          {navItems.map(item => (
            <Link key={item.href} href={item.href} style={{
              ...s.navItem,
              ...(router.pathname === item.href ? s.navItemActive : {})
            }}>
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <button onClick={handleLogout} style={s.logoutBtn}>
          ↩ Esci
        </button>
      </aside>
      <main style={s.main}>
        {children}
      </main>
    </div>
  )
}

const statusColor = {
  pending: '#f59e0b',
  approved: '#10b981',
  rejected: '#ef4444',
  suspended: '#6b7280',
}

const s = {
  shell: {
    display: 'flex',
    minHeight: '100vh',
    background: '#0f0a0a',
    fontFamily: 'Georgia, serif',
    color: '#f5e6e0',
  },
  sidebar: {
    width: '240px',
    minHeight: '100vh',
    background: '#1a1010',
    borderRight: '1px solid #3a2020',
    display: 'flex',
    flexDirection: 'column',
    padding: '32px 16px',
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
  },
  logo: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#e8320a',
    marginBottom: '32px',
    paddingLeft: '12px',
  },
  userBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    background: '#120c0c',
    borderRadius: '10px',
    marginBottom: '24px',
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    overflow: 'hidden',
    background: '#3a2020',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  avatarInitial: {
    color: '#e8320a',
    fontWeight: 'bold',
    fontSize: '16px',
  },
  userName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#f5e6e0',
  },
  userStatus: (status) => ({
    fontSize: '11px',
    color: statusColor[status] || '#9a7a72',
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    marginTop: '2px',
  }),
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    flex: 1,
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    borderRadius: '8px',
    color: '#9a7a72',
    textDecoration: 'none',
    fontSize: '15px',
    transition: 'all 0.15s',
  },
  navItemActive: {
    background: '#2a1010',
    color: '#f5e6e0',
    borderLeft: '3px solid #e8320a',
  },
  logoutBtn: {
    background: 'transparent',
    border: '1px solid #3a2020',
    color: '#9a7a72',
    borderRadius: '8px',
    padding: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    fontFamily: 'Georgia, serif',
    marginTop: '16px',
  },
  main: {
    marginLeft: '240px',
    flex: 1,
    padding: '48px',
    maxWidth: '900px',
  },
}
