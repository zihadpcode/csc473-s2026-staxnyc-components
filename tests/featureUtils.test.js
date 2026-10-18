import test from 'node:test'
import assert from 'node:assert/strict'
import { parseYouTubeId } from '../src/lib/highlights.js'
import { buildComparisonInsights } from '../src/lib/comparisonInsights.js'
test('video parser accepts only known YouTube hosts and complete IDs', () => {
  assert.equal(
    parseYouTubeId('https://www.youtube.com/watch?v=abcdefghijk'),
    'abcdefghijk',
  )
  assert.equal(parseYouTubeId('https://youtu.be/abcdefghijk'), 'abcdefghijk')
  assert.equal(parseYouTubeId('https://evil.example/watch?v=abcdefghijk'), '')
  assert.equal(parseYouTubeId('https://notyoutube.com/shorts/abcdefghijk'), '')
  assert.equal(parseYouTubeId('https://youtube.com/shorts/short'), '')
  assert.equal(parseYouTubeId('__HIDDEN__'), '')
})
test('comparison insights report ties and preserve missing values separately from zero', () => {
  const lines = buildComparisonInsights([
    { player_name: 'A', ppg: 10, apg: 0 },
    { player_name: 'B', ppg: 10, apg: null },
  ])
  assert.ok(lines.some((line) => line.includes('A and B tied at 10.0')))
  assert.ok(
    lines.some(
      (line) =>
        line.includes('Assists') &&
        line.includes('0.0') &&
        line.includes('no recorded value'),
    ),
  )
})
