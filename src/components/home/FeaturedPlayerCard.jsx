import { useNavigate } from 'react-router-dom'

export default function FeaturedPlayerCard({ player }) {
  const navigate = useNavigate()
  return (
    <article className="player-card">
      <div className="player-image">
        {player.image ? (
          <img src={player.image} alt={player.name} />
        ) : (
          <div className="player-image-fallback">
            {player.name?.charAt(0) || '?'}
          </div>
        )}
      </div>
      <div className="player-content">
        <h3>{player.name}</h3>
        {player.team && (
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
            {player.team} • {player.position}
          </p>
        )}
        <div className="btn-row">
          <button className="btn primary" onClick={() => navigate('/player/' + player.id)}>
            View Profile
          </button>
        </div>
      </div>
    </article>
  )
}
