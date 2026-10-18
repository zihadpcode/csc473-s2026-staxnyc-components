import { useEffect, useId, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { searchPlayers } from '../../lib/api'
export default function PlayerSearchBar() {
  const [query, setQuery] = useState(''),
    [results, setResults] = useState([]),
    [active, setActive] = useState(-1),
    [error, setError] = useState(''),
    [loading, setLoading] = useState(false),
    [open, setOpen] = useState(false)
  const id = useId(),
    navigate = useNavigate(),
    root = useRef(null)
  useEffect(() => {
    let alive = true
    setResults([])
    setActive(-1)
    setError('')
    if (!query.trim()) {
      setLoading(false)
      return
    }
    setLoading(true)
    const timer = setTimeout(
      () =>
        searchPlayers(query, 8)
          .then((rows) => {
            if (alive) setResults(rows || [])
          })
          .catch(() => {
            if (alive)
              setError(
                'Player search is unavailable. Try the player directory.',
              )
          })
          .finally(() => {
            if (alive) setLoading(false)
          }),
      250,
    )
    return () => {
      alive = false
      clearTimeout(timer)
    }
  }, [query])
  useEffect(() => {
    const close = (event) => {
      if (!root.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [])
  function choose(player) {
    setOpen(false)
    navigate('/player/' + player.player_id)
  }
  return (
    <form
      ref={root}
      className="home-search"
      onSubmit={(event) => {
        event.preventDefault()
        if (open && results.length) choose(results[Math.max(active, 0)])
        else navigate('/players?search=' + encodeURIComponent(query))
      }}
    >
      <label htmlFor={id}>Search any player</label>
      <div className="search-control">
        <input
          id={id}
          type="search"
          autoComplete="off"
          placeholder="Find a player…"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open && Boolean(query.trim())}
          aria-controls={id + '-results'}
          aria-activedescendant={
            active >= 0 && results[active] ? id + '-' + active : undefined
          }
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value)
            setOpen(true)
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape') setOpen(false)
            if (event.key === 'ArrowDown') {
              event.preventDefault()
              setOpen(true)
              setActive((previous) =>
                results.length ? (previous + 1) % results.length : -1,
              )
            }
            if (event.key === 'ArrowUp') {
              event.preventDefault()
              setActive((previous) =>
                results.length
                  ? (previous - 1 + results.length) % results.length
                  : -1,
              )
            }
          }}
        />
        <button className="btn primary">Search ↗</button>
      </div>
      {open && query.trim() && (
        <div className="home-search-dropdown">
          <div id={id + '-results'} role="listbox">
            {results.map((player, index) => (
              <div
                key={player.player_id}
                id={id + '-' + index}
                role="option"
                aria-selected={active === index}
                className={active === index ? 'selected' : ''}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => choose(player)}
              >
                {player.player_name}
                <span>{player.team}</span>
              </div>
            ))}
          </div>
          {loading ? (
            <p role="status">Searching…</p>
          ) : error ? (
            <p role="alert">{error}</p>
          ) : (
            !results.length && <p role="status">No matching players.</p>
          )}
        </div>
      )}
    </form>
  )
}
