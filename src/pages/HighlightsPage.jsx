import HighlightCard from '../components/highlights/HighlightCard'
import PageHeading from '../components/common/PageHeading'
import FeedState from '../components/common/FeedState'
import useResource from '../hooks/useResource'
import { getGameHighlights } from '../lib/api'
import './HighlightsPage.css'
export default function HighlightsPage() {
  const feed = useResource((signal) => getGameHighlights(20, signal))
  return (
    <main className="container">
      <PageHeading eyebrow="BEYOND THE BOX SCORE" title="The highlight reel.">
        Game videos from the connected highlights feed.
      </PageHeading>
      {feed.loading || feed.error ? (
        <FeedState {...feed} />
      ) : feed.data?.length ? (
        <div className="highlights-grid">
          {feed.data.map((h) => (
            <HighlightCard key={h.id || h.youtube_video_id} highlight={h} />
          ))}
        </div>
      ) : (
        <FeedState title="No highlights yet">
          New videos will appear when the feed has records.
        </FeedState>
      )}
    </main>
  )
}
