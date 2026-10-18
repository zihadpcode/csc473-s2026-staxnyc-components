import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { requestPasswordReset, updatePassword } from '../lib/auth'
import { isConfigured } from '../lib/supabase'
export default function PasswordRecoveryPage({ reset = false }) {
  const { user, loading } = useAuth(),
    navigate = useNavigate()
  const [value, setValue] = useState(''),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [done, setDone] = useState(false)
  async function submit(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      if (reset) {
        await updatePassword(value)
        navigate('/profile')
      } else {
        await requestPasswordReset(value)
        setDone(true)
      }
    } catch (error) {
      setError(error.message)
    } finally {
      setBusy(false)
    }
  }
  return (
    <main className="container">
      <section className="card auth-card">
        <p className="eyebrow">ACCOUNT ACCESS</p>
        <h1>{reset ? 'Choose a new password.' : 'Reset your password.'}</h1>
        {reset && !user ? (
          <p className="muted">
            {loading ? (
              'Checking your session…'
            ) : (
              <>
                Open a valid recovery link or{' '}
                <Link to="/forgot-password">request a new one</Link>.
              </>
            )}
          </p>
        ) : done ? (
          <p role="status" className="notice">
            If this address has an account, a password-reset email will arrive
            shortly.
          </p>
        ) : (
          <form className="auth-form" onSubmit={submit}>
            <label>
              {reset ? 'New password' : 'Email'}
              <input
                className="input"
                type={reset ? 'password' : 'email'}
                autoComplete={reset ? 'new-password' : 'email'}
                minLength={reset ? 8 : undefined}
                required
                value={value}
                onChange={(event) => setValue(event.target.value)}
              />
            </label>
            {error && (
              <p role="alert" className="notice">
                {error}
              </p>
            )}
            <button className="btn primary" disabled={busy || !isConfigured}>
              {busy
                ? 'Working…'
                : reset
                  ? 'Save password'
                  : 'Send recovery link'}
            </button>
          </form>
        )}
        <p className="auth-footer">
          <Link to="/login">Back to login</Link>
        </p>
      </section>
    </main>
  )
}
