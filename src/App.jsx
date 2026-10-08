import { Component, lazy, Suspense, useEffect } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { AuthProvider } from './lib/AuthContext'
import { StackProvider } from './hooks/usePlayerStack'
import Navbar from './components/layout/Navbar'
import HomePage from './pages/HomePage'
import RequireAdmin from './components/admin/RequireAdmin'
import FeedState from './components/common/FeedState'
const PlayerPage = lazy(() => import('./pages/PlayerPage'))
const PlayersPage = lazy(() => import('./pages/PlayersPage'))
const LiveGamesPage = lazy(() => import('./pages/LiveGamesPage'))
const StandingsPage = lazy(() => import('./pages/StandingsPage'))
const ComparePage = lazy(() => import('./pages/ComparePage'))
const HighlightsPage = lazy(() => import('./pages/HighlightsPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const SignupPage = lazy(() => import('./pages/SignupPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const AdminPage = lazy(() => import('./pages/AdminPage'))
class RouteBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? (
      <main className="container">
        <FeedState
          error="This page could not load. Reload the site to try again."
          retry={() => window.location.reload()}
        />
      </main>
    ) : (
      this.props.children
    )
  }
}
function Workspace() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
    document.getElementById('workspace')?.focus()
  }, [pathname])
  return (
    <>
      <a className="skip-link" href="#workspace">
        Skip to content
      </a>
      <Navbar />
      <div className="workspace" id="workspace" tabIndex={-1}>
        <div className="workspace-top">
          <span>THE STAX WORKSPACE</span>
          <span>NBA / BASKETBALL</span>
        </div>
        <RouteBoundary key={pathname}>
          <Suspense
            fallback={
              <main className="container">
                <FeedState loading />
              </main>
            }
          >
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/players" element={<PlayersPage />} />
              <Route path="/stack" element={<PlayersPage savedOnly />} />
              <Route path="/player/:id" element={<PlayerPage />} />
              <Route path="/live-games" element={<LiveGamesPage />} />
              <Route path="/standings" element={<StandingsPage />} />
              <Route path="/compare" element={<ComparePage />} />
              <Route path="/highlights" element={<HighlightsPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route
                path="/admin"
                element={
                  <RequireAdmin>
                    <AdminPage />
                  </RequireAdmin>
                }
              />
              <Route
                path="*"
                element={
                  <main className="container">
                    <FeedState title="This page is out of bounds">
                      <Link to="/">Back to the overview →</Link>
                    </FeedState>
                  </main>
                }
              />
            </Routes>
          </Suspense>
        </RouteBoundary>
        <footer className="site-footer">
          <span>STAXNYC</span>
          <span>A better view of the game.</span>
        </footer>
      </div>
    </>
  )
}
export default function App() {
  return (
    <AuthProvider>
      <StackProvider>
        <Workspace />
      </StackProvider>
    </AuthProvider>
  )
}
