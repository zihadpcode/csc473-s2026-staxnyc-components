import { useState } from 'react'
import GameStatusBadge from './GameStatusBadge'
import TeamScoreRow from './TeamScoreRow'
import LiveChatModal from '../live-chat/LiveChatModal'
import AskAboutPredictionModal from '../predictions/AskAboutPredictionModal'
import { useAuth } from '../../lib/AuthContext'
import { deleteLiveGame } from '../../lib/api'
export default function GameCard({ game, prediction, onDelete }) {
  const { isAdmin } = useAuth(),
    [chat, setChat] = useState(false),
    [ask, setAsk] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('')
  const status = (game.status || '').toLowerCase(),
    probability = Number(prediction?.home_win_prob)
  const validProbability =
    prediction?.home_win_prob != null &&
    Number.isFinite(probability) &&
    probability >= 0 &&
    probability <= 1
  const pick = ['home', 'away'].includes(prediction?.prediction)
    ? prediction.prediction
    : validProbability
      ? probability >= 0.5
        ? 'home'
        : 'away'
      : null
  const favored =
    pick === 'home' ? game.home_team : pick === 'away' ? game.away_team : null
  async function remove() {
    if (
      !window.confirm(
        'Remove ' +
          game.away_team +
          ' at ' +
          game.home_team +
          ' from the schedule?',
      )
    )
      return
    setBusy(true)
    setError('')
    try {
      await deleteLiveGame(game.game_id)
      onDelete?.(game.game_id)
    } catch (error) {
      setError(error.message)
    } finally {
      setBusy(false)
    }
  }
  return (
    <article className="card game-card">
      <div className="section-heading">
        <GameStatusBadge status={game.status} />
        <span className="muted">
          {status === 'live'
            ? [game.quarter, game.time_remaining].filter(Boolean).join(' ')
            : ['scheduled', 'upcoming'].includes(status) && game.game_date
              ? new Date(game.game_date).toLocaleTimeString([], {
                  hour: 'numeric',
                  minute: '2-digit',
                })
              : ''}
        </span>
      </div>
      <div className="score-matchup">
        <TeamScoreRow teamName={game.away_team} score={game.away_score} />
        <span className="muted">vs</span>
        <TeamScoreRow teamName={game.home_team} score={game.home_score} />
      </div>
      {favored && (
        <section className="game-prediction">
          <p>
            <strong>{favored}</strong> favored by the stored model
            {validProbability
              ? ' · ' +
                (
                  (pick === 'home' ? probability : 1 - probability) * 100
                ).toFixed(1) +
                '%'
              : ''}
          </p>
          {prediction.rationale && (
            <p className="muted">{prediction.rationale}</p>
          )}
          <button className="btn-ghost" onClick={() => setAsk(true)}>
            Ask why?
          </button>
        </section>
      )}
      <div className="game-actions">
        <button className="btn-ghost" onClick={() => setChat(true)}>
          {status === 'live' ? 'Join live chat' : 'Open chat'}
        </button>
        {isAdmin && (
          <button className="btn-ghost danger" disabled={busy} onClick={remove}>
            {busy ? 'Removing…' : 'Remove game'}
          </button>
        )}
      </div>
      {error && (
        <p className="notice" role="alert">
          {error}
        </p>
      )}
      {chat && <LiveChatModal game={game} onClose={() => setChat(false)} />}{' '}
      {ask && (
        <AskAboutPredictionModal
          game={game}
          prediction={prediction}
          onClose={() => setAsk(false)}
        />
      )}
    </article>
  )
}
