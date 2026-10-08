import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeading from '../components/common/PageHeading'
import FeedState from '../components/common/FeedState'
import FeaturedPlayerCard from '../components/home/FeaturedPlayerCard'
import useResource from '../hooks/useResource'
import { usePlayerStack } from '../hooks/usePlayerStack'
import { getPlayerDirectory } from '../lib/api'
import { selectPlayers } from '../lib/playerUtils'
export default function PlayersPage({ savedOnly = false }) {
  const feed = useResource(getPlayerDirectory)
  const [query, setQuery] = useState('')
  const [team, setTeam] = useState('All')
  const [sort, setSort] = useState('ppg')
  const { ids, storageError } = usePlayerStack()
  const players = feed.data || []
  const teams = useMemo(
    () => [...new Set(players.map((p) => p.team).filter(Boolean))].sort(),
    [feed.data],
  )
  const filtered = selectPlayers(players, {
    query,
    team,
    sort,
    savedOnly,
    savedIds: ids,
  })
  const unavailable =
    savedOnly && feed.data
      ? ids.filter((id) => !players.some((p) => String(p.player_id) === id))
      : []
  return (
    <main className="container">
      <PageHeading
        eyebrow={savedOnly ? 'YOUR PERSONAL SHORTLIST' : 'THE PLAYER EXPLORER'}
        title={savedOnly ? 'My stack.' : 'Find your edge.'}
      >
        {savedOnly
          ? 'Your saved players, with stats from the connected feed. Saved in this browser, up to 50 players.'
          : 'Search the roster, narrow the field, and discover the numbers behind each player.'}
      </PageHeading>
      {storageError && (
        <p className="notice" role="status">
          {storageError}
        </p>
      )}
      <section className="directory-controls" aria-label="Player filters">
        <label className="search-field">
          <span>Search players</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name…"
            type="search"
          />
        </label>
        <label>
          <span>Team</span>
          <select value={team} onChange={(e) => setTeam(e.target.value)}>
            <option value="All">All teams</option>
            {teams.map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
        </label>
        <label>
          <span>Sort by</span>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="ppg">Points per game</option>
            <option value="rpg">Rebounds per game</option>
            <option value="apg">Assists per game</option>
            <option value="name">Name A–Z</option>
          </select>
        </label>
      </section>
      <p className="result-count" role="status">
        {feed.data ? filtered.length + ' players' : 'Waiting for the feed'}
      </p>
      {feed.loading || feed.error ? (
        <FeedState {...feed} />
      ) : filtered.length ? (
        <div className="player-grid">
          {filtered.map((player) => (
            <FeaturedPlayerCard key={player.player_id} player={player} />
          ))}
        </div>
      ) : (
        <FeedState
          title={
            savedOnly && !ids.length
              ? 'Build your first stack'
              : 'No players match'
          }
        >
          {savedOnly && !ids.length ? (
            <Link to="/players">
              Explore players and use the star to save them →
            </Link>
          ) : (
            <button
              className="btn-ghost"
              onClick={() => {
                setQuery('')
                setTeam('All')
              }}
            >
              Clear filters
            </button>
          )}
        </FeedState>
      )}
      {unavailable.length > 0 && (
        <section className="notice">
          <p>
            {unavailable.length} saved players are no longer in the connected
            roster.
          </p>
          <UnavailablePlayers ids={unavailable} />
        </section>
      )}
    </main>
  )
}
function UnavailablePlayers({ ids }) {
  const { toggle } = usePlayerStack()
  return (
    <div className="unavailable-players">
      {ids.map((id) => (
        <button key={id} className="btn-ghost" onClick={() => toggle(id)}>
          Remove unavailable player {id}
        </button>
      ))}
    </div>
  )
}
