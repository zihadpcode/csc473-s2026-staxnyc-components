import { useEffect, useState } from 'react'
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../lib/AuthContext'
import { usePlayerStack } from '../../hooks/usePlayerStack'
import { signOut } from '../../lib/auth'
export default function Navbar() {
  const { user, isAdmin } = useAuth()
  const { ids } = usePlayerStack()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => {
    setOpen(false)
  }, [pathname])
  useEffect(() => {
    const close = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [])
  async function logout() {
    try {
      await signOut()
      navigate('/')
    } catch {
      setError('Could not log out. Please try again.')
    }
  }
  const links = [
    ['/', 'Overview', '↗'],
    ['/players', 'Players', '◎'],
    ['/stack', 'My stack', '▤'],
    ['/compare', 'Compare', '⇄'],
    ['/live-games', 'Game center', '◷'],
    ['/standings', 'Standings', '▥'],
    ['/highlights', 'Highlights', '▷'],
  ]
  return (
    <>
      <header className="mobile-header">
        <Link to="/" className="wordmark">
          STAX<span>NYC</span>
        </Link>
        <button
          className="btn-ghost"
          aria-controls="site-navigation"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? 'Close' : 'Menu'}
        </button>
      </header>
      <aside className={'sidebar' + (open ? ' is-open' : '')}>
        <Link to="/" className="wordmark">
          STAX<span>NYC</span>
          <small>BASKETBALL INTELLIGENCE</small>
        </Link>
        <p className="nav-caption">WORKSPACE</p>
        <nav id="site-navigation" aria-label="Main navigation">
          {links.map(([to, label, icon]) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                'side-link' + (isActive ? ' active' : '')
              }
            >
              <span aria-hidden="true">{icon}</span>
              {label}
              {to === '/stack' && <b>{ids.length}</b>}
            </NavLink>
          ))}
          {isAdmin && (
            <NavLink to="/admin" className="side-link">
              Admin
            </NavLink>
          )}
        </nav>
        <div className="sidebar-bottom">
          <p>
            Built for the love
            <br />
            of the game.
          </p>
          {user ? (
            <>
              <Link className="btn-ghost" to="/profile">
                Your account
              </Link>
              <button className="btn-ghost" onClick={logout}>
                Log out
              </button>
            </>
          ) : (
            <Link className="btn primary" to="/login">
              Log in <span aria-hidden="true">↗</span>
            </Link>
          )}
          {error && <p role="alert">{error}</p>}
          <small>NEW YORK · EVERY COURT</small>
        </div>
      </aside>
    </>
  )
}
