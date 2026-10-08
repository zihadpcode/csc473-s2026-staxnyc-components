import { Link } from 'react-router-dom'
import FeaturedPlayerCard from '../components/home/FeaturedPlayerCard'
import FeedState from '../components/common/FeedState'
import useResource from '../hooks/useResource'
import { usePlayerStack } from '../hooks/usePlayerStack'
import { getPlayerDirectory } from '../lib/api'
import { selectPlayers } from '../lib/playerUtils'
import { isConfigured } from '../lib/supabase'
export default function HomePage() {
  const feed = useResource(getPlayerDirectory)
  const players = feed.data || []
  const { ids } = usePlayerStack()
  const leaders = selectPlayers(players).slice(0, 4)
  return (
    <main className="container">
      <div className="overview-intro">
        <p className="eyebrow">YOUR COURTSIDE ADVANTAGE</p>
        <span className="connection-badge">
          <i className={feed.data ? 'configured' : ''} />
          {!isConfigured
            ? 'Explore mode'
            : feed.error
              ? 'Feed unavailable'
              : feed.loading
                ? 'Connecting feed'
                : 'Connected feed'}
        </span>
      </div>
      <section className="overview-hero">
        <div className="hero-copy">
          <p className="hero-kicker">LESS GUESSWORK. MORE GAME.</p>
          <h1>
            Know the numbers.
            <br />
            <em>See the game.</em>
          </h1>
          <p>
            Follow the players that matter. Explore their performance, compare
            the details, and build your own view of the league.
          </p>
          <div className="hero-actions">
            <Link className="btn primary" to="/players">
              Explore players <span aria-hidden="true">↗</span>
            </Link>
            <Link className="btn-ghost" to="/compare">
              Compare players →
            </Link>
          </div>
        </div>
        <div className="court-art" aria-hidden="true">
          <div className="court-line court-center" />
          <div className="court-line court-key" />
          <div className="court-line court-arc" />
          <span className="court-coordinate">
            40.7128° N<br />
            74.0060° W
          </span>
          <span className="court-note">
            EVERY POSSESSION
            <br />
            TELLS A STORY.
          </span>
          <span className="court-ball" />
        </div>
      </section>
      <div className="overview-metrics">
        <Link to="/players">
          <span>PLAYER DIRECTORY</span>
          <strong>{feed.data ? players.length : '—'}</strong>
          <small>Explore the connected roster ↗</small>
        </Link>
        <Link to="/stack">
          <span>YOUR STACK</span>
          <strong>{String(ids.length).padStart(2, '0')}</strong>
          <small>Saved in this browser ↗</small>
        </Link>
        <Link to="/standings">
          <span>LEAGUE SNAPSHOT</span>
          <strong>02</strong>
          <small>Eastern & western conferences ↗</small>
        </Link>
      </div>
      <section className="home-player-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">START YOUR RESEARCH</p>
            <h2>Scoring leaders</h2>
          </div>
          <Link className="text-link" to="/players">
            View all players ↗
          </Link>
        </div>
        {feed.loading || feed.error ? (
          <FeedState {...feed} />
        ) : leaders.length ? (
          <div className="player-grid">
            {leaders.map((player) => (
              <FeaturedPlayerCard key={player.player_id} player={player} />
            ))}
          </div>
        ) : (
          <FeedState title="The roster is empty">
            Players will appear when the connected feed has records.
          </FeedState>
        )}
      </section>
      <section className="research-banner">
        <div>
          <p className="eyebrow">THE DETAILS MAKE THE DIFFERENCE</p>
          <h2>Two players. One clear view.</h2>
          <p>
            Compare scoring, playmaking, rebounding, and shooting side by side.
          </p>
        </div>
        <Link className="btn primary" to="/compare">
          Open comparison ↗
        </Link>
      </section>
    </main>
  )
}
