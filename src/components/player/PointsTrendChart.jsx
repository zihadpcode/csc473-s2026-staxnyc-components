import { useState } from 'react'
import { formatStat } from '../../lib/playerUtils'
export default function PointsTrendChart({ games, avgPpg }) {
  const [metric, setMetric] = useState('pts')
  const rows = [...games]
    .filter(
      (game) =>
        game[metric] != null &&
        game[metric] !== '' &&
        Number.isFinite(Number(game[metric])),
    )
    .sort((a, b) => Date.parse(a.game_date) - Date.parse(b.game_date))
  const width = 600,
    height = 230,
    pad = 35,
    max = Math.max(...rows.map((game) => Number(game[metric])), 1)
  const x = (index) =>
    rows.length === 1
      ? width / 2
      : pad + (index * (width - 2 * pad)) / (rows.length - 1)
  const y = (value) => height - pad - (Number(value) / max) * (height - 2 * pad)
  const label = { pts: 'Points', reb: 'Rebounds', ast: 'Assists' }[metric]
  return (
    <article className="card section-card">
      <div className="section-heading">
        <div>
          <h2>Recent scoring trend</h2>
          <p className="muted">Last {games.length} games · oldest to newest</p>
        </div>
        <label className="trend-selector">
          Metric
          <select
            value={metric}
            onChange={(event) => setMetric(event.target.value)}
          >
            <option value="pts">Points</option>
            <option value="reb">Rebounds</option>
            <option value="ast">Assists</option>
          </select>
        </label>
      </div>
      {!rows.length ? (
        <p className="muted">No {label.toLowerCase()} values recorded.</p>
      ) : (
        <svg
          className="trend-chart"
          viewBox={'0 0 ' + width + ' ' + height}
          role="img"
          aria-label={label + ' trend across ' + rows.length + ' games'}
        >
          {[0, 0.5, 1].map((value) => (
            <g key={value}>
              <line
                x1={pad}
                x2={width - pad}
                y1={y(max * value)}
                y2={y(max * value)}
                stroke="var(--panel-border)"
              />
              <text
                x={pad - 8}
                y={y(max * value) + 4}
                textAnchor="end"
                fill="var(--muted)"
                fontSize="11"
              >
                {Math.round(max * value)}
              </text>
            </g>
          ))}
          {metric === 'pts' &&
            Number.isFinite(Number(avgPpg)) &&
            Number(avgPpg) <= max && (
              <line
                x1={pad}
                x2={width - pad}
                y1={y(avgPpg)}
                y2={y(avgPpg)}
                stroke="var(--accent)"
                strokeDasharray="5 5"
              />
            )}
          <polyline
            points={rows
              .map((game, index) => x(index) + ',' + y(game[metric]))
              .join(' ')}
            fill="none"
            stroke="var(--accent-2)"
            strokeWidth="3"
          />
          {rows.map((game, index) => (
            <g key={game.game_id || game.game_date}>
              <circle
                cx={x(index)}
                cy={y(game[metric])}
                r="5"
                fill="var(--accent-2)"
              >
                <title>
                  {String(game.game_date).slice(0, 10)}:{' '}
                  {formatStat(game[metric])} {label.toLowerCase()}
                </title>
              </circle>
              <text
                x={x(index)}
                y={height - 10}
                textAnchor="middle"
                fill="var(--muted)"
                fontSize="9"
              >
                {String(game.game_date).slice(5, 10)}
              </text>
            </g>
          ))}
        </svg>
      )}
      <p className="muted">
        {metric === 'pts' ? 'Dashed line: season points average. ' : ''}Exact
        values are available in the recent-games table.
      </p>
    </article>
  )
}
