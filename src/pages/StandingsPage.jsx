import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import standingsData from '../data/standings'
import StandingsTable from '../components/standings/StandingsTable'
import PageHeading from '../components/common/PageHeading'
import useResource from '../hooks/useResource'
import { getStandings } from '../lib/api'
export default function StandingsPage() {
  const feed = useResource(getStandings)
  const [filter, setFilter] = useState('All'),
    [query, setQuery] = useState('')
  const connected = Boolean(feed.data?.length),
    source = connected ? feed.data : standingsData
  const rows = useMemo(
    () =>
      source
        .filter(
          (row) =>
            (filter === 'All' ||
              String(row.conference)
                .toLowerCase()
                .startsWith(filter.toLowerCase())) &&
            row.team.toLowerCase().includes(query.toLowerCase()),
        )
        .sort(
          (a, b) => a.conference.localeCompare(b.conference) || a.rank - b.rank,
        ),
    [source, filter, query],
  )
  return (
    <main className="container">
      <PageHeading
        eyebrow="THE LEAGUE AT A GLANCE"
        title="Conference standings."
      >
        Select a team to open its roster.
      </PageHeading>
      {connected ? (
        <p className="notice">
          Connected standings feed · {source[0].season || 'Season not provided'}
          {source[0].updated_at
            ? ' · Updated ' + new Date(source[0].updated_at).toLocaleString()
            : ' · Update date not provided'}
          . Feed freshness depends on the connected data sync.
        </p>
      ) : (
        <p className="notice">
          Saved repository snapshot ·{' '}
          {feed.loading
            ? 'Checking the connected standings service.'
            : feed.error
              ? 'The connected standings service is unavailable.'
              : 'The connected feed has no standings records.'}{' '}
          These are the original project's standings, not current NBA results.
          The source file does not specify a season or update date.{' '}
          {!feed.loading && (
            <button className="btn-ghost" onClick={feed.retry}>
              Retry standings
            </button>
          )}
        </p>
      )}
      <section className="directory-controls">
        <label className="search-field">
          <span>Find a team</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search teams…"
          />
        </label>
        <div className="conference-tabs" aria-label="Conference filter">
          {['All', 'East', 'West'].map((name) => (
            <button
              key={name}
              aria-pressed={filter === name}
              className={'btn-ghost' + (filter === name ? ' selected' : '')}
              onClick={() => setFilter(name)}
            >
              {name === 'All' ? 'Both conferences' : name}
            </button>
          ))}
        </div>
      </section>
      <section className="card panel">
        <StandingsTable rows={rows} />
        {!rows.length && <p className="muted">No teams match your search.</p>}
      </section>
      <p className="muted">
        <Link to="/players">Browse the full player directory →</Link>
      </p>
    </main>
  )
}
