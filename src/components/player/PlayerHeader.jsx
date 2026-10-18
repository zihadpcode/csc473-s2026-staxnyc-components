import PlayerImage from '../common/PlayerImage'
import { Link } from 'react-router-dom'
import { teamRosterPath } from '../../lib/teamBranding'
import { formatStat } from '../../lib/playerUtils'
export default function PlayerHeader({ stats }) {
  return (
    <article className="card player-hero">
      <div className="hero-top" />
      <div className="hero-body">
        <div className="player-main">
          <div className="player-avatar" aria-hidden="true">
            <PlayerImage player={stats} />
          </div>
          <div className="player-info">
            <p className="eyebrow">
              <Link to={teamRosterPath(stats.team) || '/standings'}>
                {stats.team || 'NBA'}
              </Link>{' '}
              / {stats.position || 'PLAYER'}
            </p>
            <h1 className="player-name">{stats.player_name}</h1>
            <div className="player-meta">
              {[
                stats.height,
                stats.weight && stats.weight + ' lbs',
                stats.jersey_number != null && '#' + stats.jersey_number,
              ]
                .filter(Boolean)
                .map((item) => (
                  <span key={item}>{item}</span>
                ))}
            </div>
          </div>
        </div>
        <div className="stats-grid">
          {[
            ['PPG', stats.ppg],
            ['RPG', stats.rpg],
            ['APG', stats.apg],
            ['FG%', stats.fg_pct],
            ['STL', stats.spg],
            ['BLK', stats.bpg],
            ['3P%', stats.three_pct],
            ['FT%', stats.ft_pct],
          ].map(([label, value]) => (
            <div className="stat-box" key={label}>
              <p className="stat-label">{label}</p>
              <p className="stat-value">{formatStat(value)}</p>
            </div>
          ))}
        </div>
        <p className="muted">
          Season: {stats.season || 'Not supplied by feed'}
        </p>
      </div>
    </article>
  )
}
