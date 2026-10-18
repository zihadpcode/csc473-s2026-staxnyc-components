import { useState } from 'react'
import { Link } from 'react-router-dom'
import Dialog from '../common/Dialog'
import { useAuth } from '../../lib/AuthContext'
import { requestAnalysis } from '../../lib/api'
export default function AskAboutPredictionModal({ game, prediction, onClose }) {
  const { user } = useAuth(),
    [question, setQuestion] = useState('Why does the model favor this team?'),
    [answer, setAnswer] = useState(''),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false)
  async function submit(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    setAnswer('')
    try {
      const result = await requestAnalysis(
        'ask-prediction',
        { game_id: String(game.game_id), question },
        AbortSignal.timeout(25000),
      )
      setAnswer(result.answer)
    } catch (error) {
      setError(error.message)
    } finally {
      setBusy(false)
    }
  }
  return (
    <Dialog title="About this game prediction" onClose={onClose}>
      <p className="muted">
        Stored model rationale:{' '}
        {prediction.rationale || 'No rationale provided by the feed.'}
      </p>
      {user ? (
        <form className="auth-form" onSubmit={submit}>
          <label>
            Your question
            <textarea
              className="input"
              maxLength={500}
              required
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
            />
          </label>
          <button className="btn primary" disabled={busy || !question.trim()}>
            {busy ? 'Preparing explanation…' : 'Ask about this prediction'}
          </button>
        </form>
      ) : (
        <p className="notice">
          <Link to="/login" onClick={onClose}>
            Log in
          </Link>{' '}
          to ask an AI question.
        </p>
      )}
      {error && (
        <p role="alert" className="notice">
          {error}
        </p>
      )}
      {answer && (
        <p className="analysis-answer" role="status">
          {answer}
        </p>
      )}
    </Dialog>
  )
}
