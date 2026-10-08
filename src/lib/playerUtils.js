export function formatStat(value, suffix = '') {
  if (value == null || value === '' || !Number.isFinite(Number(value)))
    return '—'
  return Number(value).toFixed(1) + suffix
}

export function selectPlayers(
  players,
  {
    query = '',
    team = 'All',
    sort = 'ppg',
    savedOnly = false,
    savedIds = [],
  } = {},
) {
  const matches = players.filter(
    (p) =>
      (p.player_name || '')
        .toLowerCase()
        .includes(query.trim().toLowerCase()) &&
      (team === 'All' || p.team === team) &&
      (!savedOnly || savedIds.includes(String(p.player_id))),
  )
  return matches.sort((a, b) =>
    sort === 'name'
      ? (a.player_name || '').localeCompare(b.player_name || '')
      : (Number(b[sort]) || 0) - (Number(a[sort]) || 0) ||
        (a.player_name || '').localeCompare(b.player_name || ''),
  )
}

export function parseSavedPlayers(value) {
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed)
      ? [
          ...new Set(
            parsed.filter((id) => typeof id === 'string' && id.length < 100),
          ),
        ].slice(0, 50)
      : []
  } catch {
    return []
  }
}

export function localDateRange(date = new Date()) {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const end = new Date(start)
  end.setDate(end.getDate() + 1)
  const format = (d) =>
    [
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, '0'),
      String(d.getDate()).padStart(2, '0'),
    ].join('-')
  return [format(start), format(end)]
}
