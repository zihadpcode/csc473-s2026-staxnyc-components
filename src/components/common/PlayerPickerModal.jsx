import Dialog from './Dialog'
export default function PlayerPickerModal({
  query,
  results,
  usedIds,
  onSearch,
  onSelect,
  onClose,
}) {
  return (
    <Dialog title="Add a player" onClose={onClose}>
      <label htmlFor="admin-player-search">Search players</label>
      <input
        id="admin-player-search"
        className="input"
        value={query}
        onChange={(event) => onSearch(event.target.value)}
        placeholder="Type a player's name…"
      />
      <div className="results">
        {!query.trim() ? (
          <p className="muted">Type a name to search.</p>
        ) : !results.length ? (
          <p className="muted">No results to show.</p>
        ) : (
          results.map((player) => (
            <button
              className="result-item"
              key={player.player_id}
              disabled={Boolean(usedIds[player.player_id])}
              onClick={() => onSelect(player.player_id)}
            >
              <span>{player.player_name}</span>
              <span className="muted">{player.team}</span>
            </button>
          ))
        )}
      </div>
    </Dialog>
  )
}
