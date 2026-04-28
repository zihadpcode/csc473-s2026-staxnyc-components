import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../lib/AuthContext'
import { signOut } from '../../lib/auth'

function NavLink({ to, label, pathname, matchPrefix = false }) {
  const active = matchPrefix ? pathname.startsWith(to) : pathname === to
  return <Link to={to} className={active ? 'active' : ''}>{label}</Link>
}

export default function Navbar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user, profile, isAdmin } = useAuth()

  async function handleLogout() {
    await signOut()
    navigate('/')
  }

  return (
    <header className="navbar">
      <div className="container nav-content">
        <Link to="/" className="brand">
          <div className="brand-badge">🏀</div>
          <span>StaxNYC Predictor</span>
        </Link>

        <nav className="nav-links" aria-label="Main navigation">
          <NavLink to="/" label="Home" pathname={pathname} />
          <NavLink to="/live-games" label="Live Games" pathname={pathname} />
          <NavLink to="/standings" label="Standings" pathname={pathname} />
          <NavLink to="/compare" label="Compare" pathname={pathname} />
          <NavLink to="/highlights" label="Highlights" pathname={pathname} />
          {user && <NavLink to="/profile" label="Profile" pathname={pathname} />}
          {isAdmin && <NavLink to="/admin" label="Admin" pathname={pathname} matchPrefix />}
        </nav>

        <div className="nav-user">
          {user ? (
            <>
              <span className="user-chip" title={user.email}>
                <span className="user-dot" />
                {profile?.display_name || user.email.split('@')[0]}
              </span>
              <button className="btn-ghost" onClick={handleLogout}>Log out</button>
            </>
          ) : (
            <Link to="/login" className="btn-ghost">Log in</Link>
          )}
        </div>
      </div>
    </header>
  )
}
