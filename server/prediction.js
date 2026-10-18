const mean = (values) =>
  values.reduce((sum, value) => sum + value, 0) / values.length
const round = (value) => Math.round(value * 10) / 10

export function cleanGameLogs(games) {
  const seen = new Set()
  return [...games]
    .filter((game) => {
      const key = String(game.game_id ?? game.game_date)
      if (
        ['scheduled', 'upcoming'].includes(
          String(game.status || '').toLowerCase(),
        )
      )
        return false
      if (Date.parse(game.game_date) > Date.now()) return false
      if (seen.has(key) || !Number.isFinite(Date.parse(game.game_date)))
        return false
      if (
        game.pts == null ||
        game.pts === '' ||
        !Number.isFinite(Number(game.pts)) ||
        Number(game.pts) < 0 ||
        Number(game.pts) > 200
      )
        return false
      if (game.min != null && game.min !== '' && Number(game.min) === 0)
        return false
      seen.add(key)
      return true
    })
    .sort((a, b) => Date.parse(a.game_date) - Date.parse(b.game_date))
}

export function fitLinearModel(samples) {
  const xMean = mean(samples.map((sample) => sample.x))
  const yMean = mean(samples.map((sample) => sample.y))
  const variance = samples.reduce(
    (sum, sample) => sum + (sample.x - xMean) ** 2,
    0,
  )
  const covariance = samples.reduce(
    (sum, sample) => sum + (sample.x - xMean) * (sample.y - yMean),
    0,
  )
  const slope = variance > 1e-8 ? covariance / variance : 0
  return { slope, intercept: yMean - slope * xMean }
}
const forecast = (model, x) =>
  Math.min(200, Math.max(0, model.intercept + model.slope * x))

export function buildPlayerPrediction(rawGames) {
  const games = cleanGameLogs(rawGames)
  if (games.length < 20)
    return {
      status: 'insufficient_data',
      games_available: games.length,
      games_required: 20,
      message:
        'At least 20 completed game logs are needed for a validated projection.',
    }
  const samples = []
  for (let i = 5; i < games.length; i++)
    samples.push({
      x: mean(games.slice(i - 5, i).map((game) => Number(game.pts))),
      y: Number(games[i].pts),
    })
  const split = Math.max(8, Math.floor(samples.length * 0.7))
  const errors = []
  const baselineErrors = []
  // Rolling-origin validation: every model sees only games before its test game.
  for (let i = split; i < samples.length; i++) {
    errors.push(
      Math.abs(
        forecast(fitLinearModel(samples.slice(0, i)), samples[i].x) -
          samples[i].y,
      ),
    )
    baselineErrors.push(Math.abs(samples[i].x - samples[i].y))
  }
  const model = fitLinearModel(samples)
  const recentAverage = mean(games.slice(-5).map((game) => Number(game.pts)))
  const points = forecast(model, recentAverage)
  const sortedErrors = [...errors].sort((a, b) => a - b)
  const radius =
    sortedErrors[Math.max(0, Math.ceil(sortedErrors.length * 0.8) - 1)]
  const validationMae = mean(errors)
  const baselineMae = mean(baselineErrors)
  return {
    status: 'ready',
    projected_points: round(points),
    recent_average: round(recentAverage),
    range: {
      low: round(Math.max(0, points - radius)),
      high: round(Math.min(200, points + radius)),
      label: 'Historical error range',
    },
    validation_mae: round(validationMae),
    baseline_mae: round(baselineMae),
    validation_samples: errors.length,
    outperforms_baseline: validationMae < baselineMae,
    training_samples: samples.length,
    games_used: games.length,
    last_game_date: games.at(-1).game_date,
    method:
      'Linear regression of next-game points on the preceding five-game average',
    caveat:
      'The range uses the 80th percentile of walk-forward absolute errors; it is not a calibrated confidence interval. Injuries, opponent and lineup changes are not model inputs. This model is fitted to the supplied logs, not a verified 2023–24 training dataset.',
    parameters: model,
  }
}
