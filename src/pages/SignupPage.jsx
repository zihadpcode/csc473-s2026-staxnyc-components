import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signUp } from '../lib/auth'
import { isConfigured } from '../lib/supabase'
export default function SignupPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  async function submit(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const result = await signUp(email, password, name)
      if (result.session) navigate('/profile')
      else setDone(true)
    } catch (error) {
      setError(error.message || 'Could not create your account.')
    } finally {
      setBusy(false)
    }
  }
  return (
    <main className="container">
      <section className="card auth-card">
        <p className="eyebrow">MAKE IT YOURS</p>
        <h1>{done ? 'Check your inbox.' : 'Join the workspace.'}</h1>
        {done ? (
          <p className="muted">
            Follow the confirmation link sent to your email, then{' '}
            <Link to="/login">log in</Link>.
          </p>
        ) : (
          <>
            {!isConfigured && (
              <p className="notice">
                Accounts are unavailable until the data connection is
                configured.
              </p>
            )}
            <form className="auth-form" onSubmit={submit}>
              <label>
                Display name
                <input
                  className="input"
                  autoComplete="nickname"
                  maxLength={80}
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>
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
                  autoComplete="new-password"
                  minLength={8}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>
              <p className="muted">Use at least 8 characters.</p>
              {error && (
                <p role="alert" className="auth-error">
                  {error}
                </p>
              )}
              <button className="btn primary" disabled={busy || !isConfigured}>
                {busy ? 'Creating…' : 'Create account →'}
              </button>
            </form>
            <p className="auth-footer">
              Already have an account? <Link to="/login">Log in</Link>
            </p>
          </>
        )}
      </section>
    </main>
  )
}
