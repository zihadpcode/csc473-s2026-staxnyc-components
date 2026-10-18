import test from 'node:test'
import assert from 'node:assert/strict'
import {
  buildPlayerPrediction,
  cleanGameLogs,
  fitLinearModel,
} from '../server/prediction.js'
const logs = (count, points = (i) => 10 + i) =>
  Array.from({ length: count }, (_, i) => ({
    game_id: String(i),
    game_date: new Date(Date.UTC(2025, 9, 1 + i)).toISOString().slice(0, 10),
    pts: points(i),
    min: 30,
  }))
test('prediction fits a known linear relationship and validates on future observations only', () => {
  const result = buildPlayerPrediction(logs(40))
  assert.equal(result.status, 'ready')
  assert.equal(result.projected_points, 50)
  assert.equal(result.validation_mae, 0)
  assert.equal(result.training_samples, 35)
  assert.ok(result.validation_samples >= 5)
  assert.ok(result.caveat.includes('not a calibrated confidence interval'))
})
test('constant scoring is stable when feature variance is zero', () => {
  const result = buildPlayerPrediction(logs(25, () => 0))
  assert.equal(result.status, 'ready')
  assert.equal(result.projected_points, 0)
  assert.equal(result.range.low, 0)
  assert.deepEqual(
    fitLinearModel([
      { x: 1, y: 3 },
      { x: 1, y: 5 },
    ]),
    { slope: 0, intercept: 4 },
  )
})
test('missing values, duplicate games, invalid dates and DNP rows cannot become training observations', () => {
  const rows = logs(20)
  const cleaned = cleanGameLogs([
    ...rows,
    rows[0],
    { game_id: 'bad', game_date: '2025-01-01', pts: null },
    { game_id: 'date', game_date: 'bad', pts: 20 },
    { game_id: 'dnp', game_date: '2025-01-02', pts: 0, min: 0 },
  ])
  assert.equal(cleaned.length, 20)
  assert.equal(buildPlayerPrediction(logs(19)).status, 'insufficient_data')
})
test('reordering source rows does not change the projection or validation', () => {
  const rows = logs(50, (i) => 15 + ((i * 7) % 13))
  assert.deepEqual(
    buildPlayerPrediction(rows),
    buildPlayerPrediction([...rows].reverse()),
  )
})

test('future schedule rows and unfinished games cannot enter a prediction', () => {
  const rows = logs(20)
  const cleaned = cleanGameLogs([
    ...rows,
    { game_id: 'future', game_date: '2099-01-01', pts: 20 },
    {
      game_id: 'upcoming',
      game_date: '2025-01-01',
      pts: 0,
      status: 'scheduled',
    },
  ])
  assert.equal(cleaned.length, 20)
})
