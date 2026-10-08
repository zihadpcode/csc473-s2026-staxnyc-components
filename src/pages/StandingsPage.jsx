import { useMemo, useState } from 'react'
import standingsData from '../data/standings'
import StandingsTable from '../components/standings/StandingsTable'
import PageHeading from '../components/common/PageHeading'
export default function StandingsPage() {
  const [filter, setFilter] = useState('All')
  const [query, setQuery] = useState('')
  const rows = useMemo(
    () =>
      standingsData
        .filter(
          (row) =>
            (filter === 'All' || row.conference === filter) &&
            row.team.toLowerCase().includes(query.toLowerCase()),
        )
        .sort(
          (a, b) => a.conference.localeCompare(b.conference) || a.rank - b.rank,
        ),
    [filter, query],
  )
  return (
    <main className="container">
      <PageHeading
        eyebrow="THE LEAGUE AT A GLANCE"
        title="Conference standings."
      >
        Find the teams, follow the records, and see where they sit.
      </PageHeading>
      <p className="notice">
        Saved repository snapshot · These are the original project's standings,
        not current NBA results. The source file does not specify a season or
        update date.
      </p>
      <section className="directory-controls">
        <label className="search-field">
          <span>Find a team</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
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
    </main>
  )
}
