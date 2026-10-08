import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import RadarChart, { STAT_KEYS } from '../components/player/RadarChart'
import PageHeading from '../components/common/PageHeading'
import FeedState from '../components/common/FeedState'
import useResource from '../hooks/useResource'
import { getPlayerDirectory } from '../lib/api'
import { formatStat } from '../lib/playerUtils'
const colors = ['#f47b40', '#9cbcf7', '#b5d49a', '#d9adf4']
export default function ComparePage() {
  const [params, setParams] = useSearchParams()
  const ids = [
    ...new Set((params.get('players') || '').split(',').filter(Boolean)),
  ].slice(0, 4)
  const feed = useResource(getPlayerDirectory)
  const [query, setQuery] = useState('')
  const [hidden, setHidden] = useState([])
  const players = feed.data || []
  const compared = ids
    .map((id) => players.find((p) => String(p.player_id) === id))
    .filter(Boolean)
  const available = useMemo(
    () =>
      players
        .filter(
          (p) =>
            !ids.includes(String(p.player_id)) &&
            (p.player_name || '')
              .toLowerCase()
              .includes(query.trim().toLowerCase()),
        )
        .slice(0, 10),
    [players, params, query],
  )
  function select(next) {
    setParams(next.length ? { players: next.join(',') } : {})
    setQuery('')
  }
  const series = compared.map((player, index) => ({
    playerId: player.player_id,
    name: player.player_name,
    color: colors[index],
    visible: !hidden.includes(String(player.player_id)),
    normValues: STAT_KEYS.map((key) => {
      const maximum = Math.max(...compared.map((p) => Number(p[key]) || 0), 1)
      return (Number(player[key]) || 0) / maximum
    }),
  }))
  return (
    <main className="container">
      <PageHeading eyebrow="SIDE BY SIDE" title="Compare the details.">
        Choose up to four players. Compare their season averages on a common
        scale, then look at the raw numbers.
      </PageHeading>
      {feed.loading || feed.error ? (
        <FeedState {...feed} />
      ) : (
        <>
          <section className="card panel compare-select">
            <label htmlFor="compare-search">Add a player</label>
            <input
              id="compare-search"
              type="search"
              placeholder="Search the roster…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={ids.length >= 4}
            />
            {ids.length >= 4 ? (
              <p className="muted">
                Four players selected. Remove one to add another.
              </p>
            ) : (
              <div className="compare-options">
                {available.map((player) => (
                  <button
                    className="btn-ghost"
                    key={player.player_id}
                    onClick={() => select([...ids, String(player.player_id)])}
                  >
                    {player.player_name}{' '}
                    <span className="muted">{player.team}</span> +
                  </button>
                ))}
                {!available.length && (
                  <p className="muted">No matching players.</p>
                )}
              </div>
            )}
          </section>
          {ids
            .filter((id) => !players.some((p) => String(p.player_id) === id))
            .map((id) => (
              <p className="notice" key={id}>
                Player {id} is unavailable.{' '}
                <button
                  className="btn-ghost"
                  onClick={() => select(ids.filter((value) => value !== id))}
                >
                  Remove
                </button>
              </p>
            ))}
          {!compared.length ? (
            <FeedState title="Start a comparison">
              Choose a player above to see their season averages.
            </FeedState>
          ) : (
            <>
              <div className="compare-cards">
                {compared.map((player, index) => (
                  <article
                    className="card panel comparison-player"
                    key={player.player_id}
                    style={{ '--player-color': colors[index] }}
                  >
                    <div className="section-heading">
                      <p className="eyebrow">{player.team}</p>
                      <button
                        className="btn-ghost"
                        aria-label={'Remove ' + player.player_name}
                        onClick={() =>
                          select(
                            ids.filter((id) => id !== String(player.player_id)),
                          )
                        }
                      >
                        ×
                      </button>
                    </div>
                    <Link to={'/player/' + player.player_id}>
                      <h2>{player.player_name}</h2>
                    </Link>
                    <label className="chart-toggle">
                      <input
                        type="checkbox"
                        checked={!hidden.includes(String(player.player_id))}
                        onChange={() =>
                          setHidden((previous) =>
                            previous.includes(String(player.player_id))
                              ? previous.filter(
                                  (id) => id !== String(player.player_id),
                                )
                              : [...previous, String(player.player_id)],
                          )
                        }
                      />
                      Show on chart
                    </label>
                  </article>
                ))}
              </div>
              <section className="card panel radar-chart-panel">
                <div className="section-heading">
                  <h2>Performance radar</h2>
                  <span className="muted">
                    Relative to the selected players
                  </span>
                </div>
                <RadarChart series={series} />
                <p className="muted">
                  Each axis is normalized to the highest value among the
                  selected players. Missing stats appear as zero on the chart
                  and as — in the table.
                </p>
              </section>
              <section className="card panel">
                <div className="table-wrap">
                  <table>
                    <caption>Season averages</caption>
                    <thead>
                      <tr>
                        <th scope="col">Statistic</th>
                        {compared.map((p) => (
                          <th key={p.player_id} scope="col">
                            {p.player_name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ['ppg', 'Points per game'],
                        ['rpg', 'Rebounds per game'],
                        ['apg', 'Assists per game'],
                        ['fg_pct', 'Field goal %'],
                      ].map(([key, label]) => (
                        <tr key={key}>
                          <th scope="row">{label}</th>
                          {compared.map((p) => (
                            <td key={p.player_id}>
                              {formatStat(p[key], key === 'fg_pct' ? '%' : '')}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}
        </>
      )}
    </main>
  )
}
