import { useState } from 'react'
import useResource from '../../hooks/useResource'
import { getLiveGames, upsertHighlight } from '../../lib/api'
import { parseYouTubeId } from '../../lib/highlights'
export default function AdminHighlightForm({ onSaved }) {
  const games = useResource((signal) => getLiveGames(null, null, signal))
  const [id, setId] = useState(''),
    [url, setUrl] = useState(''),
    [title, setTitle] = useState(''),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [done, setDone] = useState('')
  const selected = games.data?.find((game) => String(game.game_id) === id),
    videoId = parseYouTubeId(url)
  async function submit(event) {
    event.preventDefault()
    if (!selected || !videoId || !title.trim() || busy) return
    setBusy(true)
    setError('')
    setDone('')
    try {
      await upsertHighlight({
        game_id: id,
        home_team: selected.home_team,
        away_team: selected.away_team,
        youtube_video_id: videoId,
        video_title: title.trim(),
        thumbnail_url: 'https://i.ytimg.com/vi/' + videoId + '/hqdefault.jpg',
      })
      setDone('Highlight saved.')
      setTitle('')
      setUrl('')
      onSaved()
    } catch (error) {
      setError(error.message)
    } finally {
      setBusy(false)
    }
  }
  return (
    <section className="card panel">
      <h2>Add or replace a highlight</h2>
      {games.error && (
        <p role="alert" className="notice">
          {games.error}
        </p>
      )}
      <form className="highlight-admin-form" onSubmit={submit}>
        <label>
          Game
          <select
            value={id}
            onChange={(event) => setId(event.target.value)}
            required
          >
            <option value="">Select a game</option>
            {games.data?.map((game) => (
              <option key={game.game_id} value={game.game_id}>
                {game.away_team} at {game.home_team}
              </option>
            ))}
          </select>
        </label>
        <label>
          YouTube URL or video ID
          <input
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            required
          />
        </label>
        <label>
          Video title
          <input
            maxLength={180}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
          />
        </label>
        <button
          className="btn primary"
          disabled={busy || !selected || !videoId || !title.trim()}
        >
          {busy ? 'Saving…' : 'Save highlight'}
        </button>
      </form>
      {url && !videoId && (
        <p className="muted">
          Enter a valid YouTube URL or an 11-character video ID.
        </p>
      )}
      {error && (
        <p role="alert" className="notice">
          {error}
        </p>
      )}
      {done && <p role="status">{done}</p>}
    </section>
  )
}
