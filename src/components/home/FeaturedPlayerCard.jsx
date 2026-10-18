import { Link } from 'react-router-dom'
import { usePlayerStack } from '../../hooks/usePlayerStack'
import PlayerImage from '../common/PlayerImage'
import { teamRosterPath } from '../../lib/teamBranding'
import { formatStat } from '../../lib/playerUtils'
export default function FeaturedPlayerCard({ player }) {
  const { ids, toggle } = usePlayerStack()
  const id = String(player.player_id)
  const saved = ids.includes(id)
  return (
    <article className="player-tile">
      <div className="tile-top">
        <Link
          className="team-label"
          to={teamRosterPath(player.team) || '/standings'}
        >
          {player.team || 'NBA'}
        </Link>
        <button
          className={'save-button' + (saved ? ' saved' : '')}
          onClick={() => toggle(id)}
          disabled={!saved && ids.length >= 50}
          aria-pressed={saved}
          aria-label={(saved ? 'Remove ' : 'Save ') + player.player_name}
        >
          {saved ? '★' : '☆'}
        </button>
      </div>
      <Link to={'/player/' + id} className="tile-profile">
        <div className="player-monogram" aria-hidden="true">
          <PlayerImage player={player} />
        </div>
        <p className="eyebrow">{player.position || 'PLAYER'}</p>
        <h3>{player.player_name}</h3>
      </Link>
      <div className="tile-stats">
        {[
          ['ppg', 'PTS'],
          ['rpg', 'REB'],
          ['apg', 'AST'],
        ].map(([key, label]) => (
          <div key={key}>
            <strong>{formatStat(player[key])}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>
      <Link to={'/compare?players=' + id} className="tile-compare">
        Add to comparison <span aria-hidden="true">↗</span>
      </Link>
    </article>
  )
}
