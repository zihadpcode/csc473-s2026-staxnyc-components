import { useState } from 'react'
import { useAuth } from '../lib/AuthContext'
import AdminHighlightForm from '../components/highlights/AdminHighlightForm'
import HighlightCard from '../components/highlights/HighlightCard'
import PageHeading from '../components/common/PageHeading'
import FeedState from '../components/common/FeedState'
import useResource from '../hooks/useResource'
import { getGameHighlights } from '../lib/api'
import './HighlightsPage.css'
export default function HighlightsPage() {
  const { isAdmin } = useAuth()
  const [query, setQuery] = useState('')
  const feed = useResource((signal) => getGameHighlights(20, signal))
  const filtered = (feed.data || []).filter((h) =>
    (h.home_team + ' ' + h.away_team + ' ' + h.video_title)
      .toLowerCase()
      .includes(query.toLowerCase()),
  )
  return (
    <main className="container">
      <PageHeading eyebrow="BEYOND THE BOX SCORE" title="The highlight reel.">
        Game videos from the connected highlights feed.
      </PageHeading>
      {isAdmin && <AdminHighlightForm onSaved={feed.retry} />}
      <label className="highlight-search">
        Filter highlights
        <input
          className="input"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search teams or video titles…"
        />
      </label>
      {feed.loading || feed.error ? (
        <FeedState {...feed} />
      ) : filtered.length ? (
        <div className="highlights-grid">
          {filtered.map((h) => (
            <HighlightCard
              key={h.id || h.youtube_video_id}
              highlight={h}
              onChanged={feed.retry}
            />
          ))}
        </div>
      ) : (
        <FeedState
          title={query ? 'No matching highlights' : 'No highlights yet'}
        >
          {query
            ? 'Try a different team or video title.'
            : 'New videos will appear when the feed has records.'}
        </FeedState>
      )}
    </main>
  )
}
