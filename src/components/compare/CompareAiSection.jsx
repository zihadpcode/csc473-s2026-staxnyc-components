import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../lib/AuthContext'
import { buildComparisonInsights } from '../../lib/comparisonInsights'
import { requestAnalysis } from '../../lib/api'
export default function CompareAiSection({ players }) {
  const { user } = useAuth(),
    [answer, setAnswer] = useState(''),
    [answerFor, setAnswerFor] = useState(''),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('')
  const selection = players.map((player) => String(player.player_id)).join(',')
  async function explain() {
    setBusy(true)
    setError('')
    try {
      const result = await requestAnalysis(
        'compare-analysis',
        { player_ids: selection.split(',') },
        AbortSignal.timeout(25000),
      )
      setAnswer(result.analysis)
      setAnswerFor(selection)
    } catch (error) {
      setError(error.message)
    } finally {
      setBusy(false)
    }
  }
  return (
    <section className="card panel comparison-insights">
      <p className="eyebrow">WHAT THE NUMBERS SAY</p>
      <h2>Comparison insights</h2>
      {players.length < 2 ? (
        <p className="muted">Add at least two players for insights.</p>
      ) : (
        <>
          <ul>
            {buildComparisonInsights(players).map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          {user ? (
            <button className="btn-ghost" onClick={explain} disabled={busy}>
              {busy ? 'Preparing analysis…' : 'Explain with AI'}
            </button>
          ) : (
            <p className="muted">
              <Link to="/login">Log in</Link> for an optional AI explanation.
            </p>
          )}
          {error && (
            <p className="notice" role="alert">
              {error}
            </p>
          )}
          {answer && answerFor === selection && (
            <p className="analysis-answer" role="status">
              {answer}
            </p>
          )}
        </>
      )}
    </section>
  )
}
