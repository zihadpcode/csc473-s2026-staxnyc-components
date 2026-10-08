import { Link, useParams } from 'react-router-dom'
import PlayerHeader from '../components/player/PlayerHeader'
import RecentGamesTable from '../components/player/RecentGamesTable'
import PointsTrendChart from '../components/player/PointsTrendChart'
import FeedState from '../components/common/FeedState'
import useResource from '../hooks/useResource'
import { usePlayerStack } from '../hooks/usePlayerStack'
import { getPlayerById, getPlayerGames } from '../lib/api'
import { formatStat } from '../lib/playerUtils'
export default function PlayerPage() {
  const { id } = useParams()
  const player = useResource((signal) => getPlayerById(id, signal), [id])
  const games = useResource((signal) => getPlayerGames(id, 10, signal), [id])
  const { ids, toggle } = usePlayerStack()
  const saved = ids.includes(String(id))
  if (player.loading || player.error)
    return (
      <main className="container">
        <FeedState {...player} />
      </main>
    )
  if (!player.data)
    return (
      <main className="container">
        <FeedState title="Player not found">
          <Link to="/players">Back to players →</Link>
        </FeedState>
      </main>
    )
  const stats = player.data
  return (
    <main className="container">
      <div className="player-toolbar">
        <Link className="text-link" to="/players">
          ← All players
        </Link>
        <div>
          <button
            className="btn-ghost"
            onClick={() => toggle(id)}
            aria-pressed={saved}
            disabled={!saved && ids.length >= 50}
          >
            {saved ? '★ Saved to stack' : '☆ Save to stack'}
          </button>
          <Link className="btn primary" to={'/compare?players=' + id}>
            Compare player ↗
          </Link>
        </div>
      </div>
      <section className="profile-layout">
        <PlayerHeader stats={stats} />
        <aside className="side-stack">
          <section className="card panel">
            <p className="eyebrow">SEASON CONTEXT</p>
            <h2>The complete picture.</h2>
            <div className="matchup-list">
              {[
                ['Games played', stats.games_played],
                ['Minutes per game', stats.mpg],
                ['Field goal %', stats.fg_pct],
              ].map(([label, value]) => (
                <div className="matchup-item" key={label}>
                  <span>{label}</span>
                  <strong>
                    {formatStat(value, label === 'Field goal %' ? '%' : '')}
                  </strong>
                </div>
              ))}
            </div>
          </section>
          <section className="card panel">
            <p className="eyebrow">PROJECTIONS</p>
            <h3>Prediction feed unavailable</h3>
            <p className="muted">
              The original repository has no connected prediction service.
              Explore actual game logs below.
            </p>
          </section>
        </aside>
      </section>
      <div className="section-heading">
        <div>
          <p className="eyebrow">BEHIND THE AVERAGE</p>
          <h2>Recent performance</h2>
        </div>
      </div>
      {games.loading || games.error ? (
        <FeedState {...games} />
      ) : games.data?.length ? (
        <section className="lower-grid">
          <PointsTrendChart games={games.data} avgPpg={formatStat(stats.ppg)} />
          <RecentGamesTable games={games.data} />
        </section>
      ) : (
        <FeedState title="No recent game logs">
          Season statistics are available above.
        </FeedState>
      )}
    </main>
  )
}
