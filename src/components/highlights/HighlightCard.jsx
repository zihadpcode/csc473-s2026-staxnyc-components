import { useState } from 'react'
import { parseYouTubeId } from '../../lib/highlights'
import { hideHighlight } from '../../lib/api'
import { useAuth } from '../../lib/AuthContext'
export default function HighlightCard({ highlight, onChanged }) {
  const { isAdmin } = useAuth(),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('')
  const id = parseYouTubeId(highlight.youtube_video_id)
  async function remove() {
    if (!window.confirm('Hide this highlight from the feed?')) return
    setBusy(true)
    setError('')
    try {
      await hideHighlight(highlight)
      onChanged?.()
    } catch (error) {
      setError(error.message)
    } finally {
      setBusy(false)
    }
  }
  return (
    <article className="card highlight-card">
      <div className="highlight-video">
        {id ? (
          <iframe
            loading="lazy"
            src={'https://www.youtube-nocookie.com/embed/' + id}
            title={highlight.video_title || 'Game highlight'}
            allow="encrypted-media; picture-in-picture"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : (
          <p className="notice">The stored video ID is invalid.</p>
        )}
      </div>
      <div className="highlight-info">
        <h3>
          {highlight.away_team} vs {highlight.home_team}
        </h3>
        <p className="muted">{highlight.video_title}</p>
        {isAdmin && (
          <button className="btn-ghost danger" disabled={busy} onClick={remove}>
            {busy ? 'Hiding…' : 'Hide highlight'}
          </button>
        )}
        {error && (
          <p className="notice" role="alert">
            {error}
          </p>
        )}
      </div>
    </article>
  )
}
