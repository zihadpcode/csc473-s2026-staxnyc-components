import useResource from '../../hooks/useResource'
import { requestAnalysis } from '../../lib/api'
import { formatStat } from '../../lib/playerUtils'
export default function PredictionCard({ playerId }) {
  const feed = useResource(
    (signal) =>
      requestAnalysis(
        'player-prediction?player_id=' + encodeURIComponent(playerId),
        null,
        signal,
      ),
    [playerId],
  )
  const prediction = feed.data
  return (
    <section className="card panel prediction-card">
      <p className="eyebrow">NEXT-GAME POINTS MODEL</p>
      <h2>Points projection</h2>
      {feed.loading ? (
        <p role="status">Fitting the model…</p>
      ) : feed.error ? (
        <>
          <p role="alert" className="muted">
            {feed.error}
          </p>
          <button className="btn-ghost" onClick={feed.retry}>
            Retry projection
          </button>
        </>
      ) : prediction?.status !== 'ready' ? (
        <p className="muted">
          {prediction?.message || 'Not enough game logs for a projection.'}
          {prediction && ' ' + prediction.games_available + ' games available.'}
        </p>
      ) : (
        <>
          <p className="projection-value">
            {formatStat(prediction.projected_points)}
            <small>PTS</small>
          </p>
          <p className="muted">
            Historical error range: {formatStat(prediction.range.low)}–
            {formatStat(prediction.range.high)}
          </p>
          <dl className="prediction-details">
            <dt>Recent five-game average</dt>
            <dd>{formatStat(prediction.recent_average)}</dd>
            <dt>Walk-forward mean error</dt>
            <dd>{formatStat(prediction.validation_mae)} points</dd>
            <dt>Validation games</dt>
            <dd>{prediction.validation_samples}</dd>
            <dt>Training examples</dt>
            <dd>{prediction.training_samples}</dd>
          </dl>
          {!prediction.outperforms_baseline && (
            <p className="notice">
              The five-game-average baseline performed as well or better on the
              validation games.
            </p>
          )}
          <details>
            <summary>How this projection works</summary>
            <p className="muted">
              {prediction.method}. Last recorded game:{' '}
              {String(prediction.last_game_date).slice(0, 10)}.
            </p>
            <p className="muted">{prediction.caveat}</p>
          </details>
        </>
      )}
    </section>
  )
}
