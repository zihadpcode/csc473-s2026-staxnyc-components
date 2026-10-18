import test from 'node:test'
import assert from 'node:assert/strict'
import {
  formatStat,
  selectPlayers,
  parseSavedPlayers,
  localDateRange,
} from '../src/lib/playerUtils.js'
const players = [
  { player_id: 1, player_name: 'Test Alpha', team: 'Team A', ppg: 10, apg: 9 },
  { player_id: 2, player_name: 'Test Beta', team: 'Team B', ppg: 25, apg: 4 },
  {
    player_id: 3,
    player_name: 'Test Gamma',
    team: 'Team A',
    ppg: null,
    apg: 6,
  },
]
test('combine saved IDs, case-insensitive search, team filtering and stat sorting without mutating feed', () => {
  assert.deepEqual(
    selectPlayers(players, {
      query: 'TEST',
      team: 'Team A',
      savedOnly: true,
      savedIds: ['1', '3'],
      sort: 'apg',
    }).map((p) => p.player_id),
    [1, 3],
  )
  assert.deepEqual(
    selectPlayers(players).map((p) => p.player_id),
    [2, 1, 3],
  )
  assert.deepEqual(
    players.map((p) => p.player_id),
    [1, 2, 3],
  )
})
test('missing stats remain distinct from a true zero', () => {
  assert.equal(formatStat(null), '—')
  assert.equal(formatStat(''), '—')
  assert.equal(formatStat('bad'), '—')
  assert.equal(formatStat(0), '0.0')
  assert.equal(formatStat('40.24', '%'), '40.2%')
})
test('corrupt or untrusted browser storage is bounded and deduplicated', () => {
  assert.deepEqual(parseSavedPlayers('bad'), [])
  assert.deepEqual(parseSavedPlayers('{"id":1}'), [])
  assert.deepEqual(parseSavedPlayers('["1",null,2,"1","2"]'), ['1', '2'])
  assert.equal(
    parseSavedPlayers(
      JSON.stringify(Array.from({ length: 80 }, (_, i) => String(i))),
    ).length,
    50,
  )
})
test('local day boundaries roll over at the end of month and year', () => {
  assert.deepEqual(localDateRange(new Date(2026, 11, 31, 23, 50)), [
    '2026-12-31',
    '2027-01-01',
  ])
  assert.deepEqual(localDateRange(new Date(2028, 1, 29, 1)), [
    '2028-02-29',
    '2028-03-01',
  ])
})
