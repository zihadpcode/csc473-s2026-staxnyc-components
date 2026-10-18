import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Dialog from '../common/Dialog'
import { useAuth } from '../../lib/AuthContext'
import {
  getChatMessages,
  getProfilesByIds,
  postChatMessage,
  subscribeChatMessages,
  deleteChatMessage,
} from '../../lib/api'
export default function LiveChatModal({ game, onClose }) {
  const { user, profile, isAdmin } = useAuth()
  const [messages, setMessages] = useState([]),
    [authors, setAuthors] = useState({}),
    [draft, setDraft] = useState(''),
    [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [connected, setConnected] = useState(false)
  useEffect(() => {
    let alive = true,
      busy = false,
      cleanup,
      controller
    const merge = (rows) =>
      setMessages((previous) => {
        const map = new Map(
          previous.map((message) => [String(message.id), message]),
        )
        rows.forEach((message) => map.set(String(message.id), message))
        return [...map.values()]
          .sort((a, b) => Date.parse(a.created_at) - Date.parse(b.created_at))
          .slice(-50)
      })
    async function authorsFor(rows) {
      try {
        const ids = [...new Set(rows.map((row) => row.user_id))]
        const names = await getProfilesByIds(ids)
        if (alive)
          setAuthors((previous) => ({
            ...previous,
            ...Object.fromEntries(
              names.map((name) => [name.id, name.display_name]),
            ),
          }))
      } catch {}
    }
    async function load() {
      if (busy) return
      busy = true
      controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 10000)
      try {
        const rows = await getChatMessages(game.game_id, controller.signal)
        if (alive) {
          setMessages(rows)
          setError('')
          authorsFor(rows)
        }
      } catch (error) {
        if (alive) setError(error.message || 'Chat is unavailable.')
      } finally {
        busy = false
        clearTimeout(timer)
        if (alive) setLoading(false)
      }
    }
    load()
    try {
      cleanup = subscribeChatMessages(
        game.game_id,
        (payload) => {
          if (!alive) return
          if (payload.eventType === 'DELETE')
            setMessages((previous) =>
              previous.filter(
                (message) => String(message.id) !== String(payload.old?.id),
              ),
            )
          else if (payload.new?.id) {
            merge([payload.new])
            authorsFor([payload.new])
          }
        },
        (status) => {
          if (alive) setConnected(status === 'SUBSCRIBED')
        },
      )
    } catch (error) {
      setError(error.message)
    }
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') load()
    }, 15000)
    return () => {
      alive = false
      clearInterval(interval)
      controller?.abort()
      cleanup?.()
    }
  }, [game.game_id])
  async function submit(event) {
    event.preventDefault()
    if (busy || !draft.trim()) return
    setBusy(true)
    setError('')
    try {
      const message = await postChatMessage(game.game_id, draft)
      setMessages((previous) =>
        [
          ...previous.filter((item) => String(item.id) !== String(message.id)),
          message,
        ].slice(-50),
      )
      setDraft('')
    } catch (error) {
      setError(error.message)
    } finally {
      setBusy(false)
    }
  }
  async function remove(message) {
    if (!window.confirm('Remove this chat message?')) return
    try {
      await deleteChatMessage(message.id)
      setMessages((previous) =>
        previous.filter((item) => item.id !== message.id),
      )
    } catch (error) {
      setError(error.message)
    }
  }
  return (
    <Dialog
      title={game.away_team + ' at ' + game.home_team + ' · Chat'}
      onClose={onClose}
    >
      <p className="muted">
        {connected
          ? 'Live updates connected.'
          : 'Chat refreshes every 15 seconds while visible.'}
      </p>
      {error && (
        <p role="alert" className="notice">
          {error}
        </p>
      )}
      <div
        className="chat-messages"
        role="log"
        aria-label="Game conversation"
        aria-live="polite"
      >
        {loading ? (
          <p role="status">Loading conversation…</p>
        ) : !messages.length ? (
          <p className="muted">No messages yet. Start the conversation.</p>
        ) : (
          messages.map((message) => (
            <article className="chat-message" key={message.id}>
              <div>
                <Link
                  className="text-link"
                  to={'/user/' + message.user_id}
                  onClick={onClose}
                >
                  {authors[message.user_id] ||
                    (message.user_id === user?.id
                      ? profile?.display_name
                      : null) ||
                    'STAX member'}
                </Link>
                <time dateTime={message.created_at}>
                  {new Date(message.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </time>
              </div>
              <p>{message.body}</p>
              {isAdmin && (
                <button className="btn-ghost" onClick={() => remove(message)}>
                  Remove message
                </button>
              )}
            </article>
          ))
        )}
      </div>
      {user ? (
        <form className="chat-compose" onSubmit={submit}>
          <label htmlFor="chat-draft">Your message</label>
          <textarea
            id="chat-draft"
            maxLength={500}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Talk about the game…"
          />
          <div>
            <span className="muted">{draft.length}/500</span>
            <button className="btn primary" disabled={busy || !draft.trim()}>
              {busy ? 'Sending…' : 'Send message'}
            </button>
          </div>
        </form>
      ) : (
        <p className="notice">
          <Link to="/login" onClick={onClose}>
            Log in
          </Link>{' '}
          to join the conversation.
        </p>
      )}
    </Dialog>
  )
}
