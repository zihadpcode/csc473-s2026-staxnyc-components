import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signIn } from '../lib/auth'
import { isConfigured } from '../lib/supabase'
export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  async function submit(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      await signIn(email, password)
      navigate('/profile')
    } catch (error) {
      setError(error.message || 'Login failed. Try again.')
    } finally {
      setBusy(false)
    }
  }
  return (
    <main className="container">
      <section className="card auth-card">
        <p className="eyebrow">BACK TO YOUR WORKSPACE</p>
        <h1>Welcome back.</h1>
        <p className="muted">Log in to manage your account.</p>
        {!isConfigured && (
          <p className="notice">
            Accounts are unavailable until the data connection is configured.
          </p>
        )}
        <form className="auth-form" onSubmit={submit}>
          <label>
            Email
            <input
              className="input"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label>
            Password
            <input
              className="input"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          {error && (
            <p role="alert" className="auth-error">
              {error}
            </p>
          )}
          <button className="btn primary" disabled={busy || !isConfigured}>
            {busy ? 'Logging in…' : 'Log in →'}
          </button>
        </form>
        <p className="auth-footer">
          New here? <Link to="/signup">Create an account</Link>
        </p>
      </section>
    </main>
  )
}
