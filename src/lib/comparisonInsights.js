import { formatStat } from './playerUtils.js'
export const comparisonMetrics = [
  ['ppg', 'Points per game'],
  ['rpg', 'Rebounds per game'],
  ['apg', 'Assists per game'],
  ['fg_pct', 'Field goal %'],
  ['spg', 'Steals per game'],
  ['bpg', 'Blocks per game'],
  ['three_pct', 'Three-point %'],
  ['ft_pct', 'Free throw %'],
  ['mpg', 'Minutes per game'],
]
export function buildComparisonInsights(players) {
  if (players.length < 2) return []
  return comparisonMetrics.map(([key, label]) => {
    const values = players.filter(
      (player) =>
        player[key] != null &&
        player[key] !== '' &&
        Number.isFinite(Number(player[key])),
    )
    if (!values.length) return label + ': no recorded values.'
    const max = Math.max(...values.map((player) => Number(player[key])))
    const leaders = values.filter((player) => Number(player[key]) === max)
    return (
      label +
      ': ' +
      leaders.map((player) => player.player_name).join(' and ') +
      (leaders.length > 1 ? ' tied at ' : ' leads at ') +
      formatStat(max, key.endsWith('pct') ? '%' : '') +
      '.' +
      (values.length < players.length
        ? ' Some selected players have no recorded value.'
        : '')
    )
  })
}
