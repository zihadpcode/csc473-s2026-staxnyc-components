function StatBox({ label, value }) {
  return (
    <div className="stat-box">
      <p className="stat-label">{label}</p>
      <p className="stat-value">{value}</p>
    </div>
  )
}

export default function PlayerHeader({ stats }) {
  const { player_name, team, position, height, weight, jersey_number, ppg, rpg, apg, fg_pct, season, games_played, mpg } = stats

  return (
    <article className="card player-hero">
      <div className="hero-top" />
      <div className="hero-body">
        <div className="player-main">
          <div className="player-avatar">
            <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', fontSize: '2rem', color: 'var(--muted)' }}>
              {player_name.charAt(0)}
            </div>
          </div>
          <div className="player-info">
            <div className="player-name-row">
              <h1 className="player-name">{player_name}</h1>
              <span className="team-pill">{team}</span>
            </div>
            <div className="player-meta">
              <span>{position}</span>
              <span>{height}</span>
              <span>{weight} lbs</span>
              <span>#{jersey_number}</span>
            </div>
          </div>
        </div>
        <div className="stats-grid">
          <StatBox label="PPG" value={ppg} />
          <StatBox label="RPG" value={rpg} />
          <StatBox label="APG" value={apg} />
          <StatBox label="FG%" value={fg_pct + '%'} />
        </div>
        <p style={{ color: 'var(--muted)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
          Season: {season} | Games: {games_played} | MPG: {mpg}
        </p>
      </div>
    </article>
  )
}
