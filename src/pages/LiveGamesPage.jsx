import { useEffect, useRef, useState } from 'react'
import GameCard from '../components/live-games/GameCard'
import PageHeading from '../components/common/PageHeading'
import FeedState from '../components/common/FeedState'
import { getLiveGames } from '../lib/api'
import { localDateRange } from '../lib/playerUtils'
export default function LiveGamesPage() {
  const [state, setState] = useState({
    games: [],
    loading: true,
    refreshing: false,
    error: '',
    updated: null,
  })
  const refreshRef = useRef(null)
  useEffect(() => {
    let active = true
    let controller
    let busy = false
    async function load() {
      if (busy) return
      busy = true
      controller = new AbortController()
      setState((previous) => ({ ...previous, refreshing: true }))
      const timer = setTimeout(() => controller.abort(), 12000)
      try {
        const [start, end] = localDateRange()
        const games = await getLiveGames(start, end, controller.signal)
        if (active)
          setState({
            games: games || [],
            loading: false,
            refreshing: false,
            error: '',
            updated: new Date(),
          })
      } catch (error) {
        if (active)
          setState((previous) => ({
            ...previous,
            loading: false,
            refreshing: false,
            error:
              'Could not refresh the schedule. ' +
              (error.message || 'Try again.'),
          }))
      } finally {
        clearTimeout(timer)
        busy = false
      }
    }
    refreshRef.current = load
    load()
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') load()
    }, 15000)
    return () => {
      active = false
      clearInterval(interval)
      controller?.abort()
      refreshRef.current = null
    }
  }, [])
  const groups = [
    ['live', 'Live now'],
    ['scheduled', 'Coming up'],
    ['final', 'Final'],
    ['other', 'Other game statuses'],
  ]
  function matches(game, status) {
    const value = (game.status || '').toLowerCase()
    return status === 'other'
      ? !['live', 'scheduled', 'final'].includes(value)
      : status === value
  }
  return (
    <main className="container">
      <PageHeading
        eyebrow="AROUND THE LEAGUE"
        title="Game center."
        action={
          <button
            className="btn primary"
            onClick={() => refreshRef.current?.()}
            disabled={state.refreshing}
          >
            {state.refreshing ? 'Refreshing…' : 'Refresh schedule ↻'}
          </button>
        }
      >
        {new Date().toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
        })}{' '}
        · Today's schedule in your local timezone.
      </PageHeading>
      {state.updated && (
        <p className="result-count">
          Last successful refresh: {state.updated.toLocaleTimeString()} · Feed
          refreshes every 15 seconds while visible.
        </p>
      )}
      {state.error && state.games.length > 0 && (
        <p className="notice" role="alert">
          {state.error} Showing the last successful feed.
        </p>
      )}
      {state.loading || (state.error && !state.games.length) ? (
        <FeedState
          loading={state.loading}
          error={state.error}
          retry={() => refreshRef.current?.()}
        />
      ) : !state.games.length ? (
        <FeedState title="No games on the schedule">
          The connected feed returned no games for today.
        </FeedState>
      ) : (
        groups.map(([status, label]) => {
          const games = state.games.filter((game) => matches(game, status))
          return (
            games.length > 0 && (
              <section className="game-section" key={status}>
                <div className="section-heading">
                  <h2>{label}</h2>
                  <span className="pill">{games.length}</span>
                </div>
                <div className="game-grid">
                  {games.map((game) => (
                    <GameCard key={game.game_id} game={game} />
                  ))}
                </div>
              </section>
            )
          )
        })
      )}
    </main>
  )
}
