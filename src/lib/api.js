import { requireClient } from './supabase'

export async function getPlayerById(playerId, signal) {
  const { data, error } = await requireClient()
    .from('player_stats')
    .select('*')
    .eq('player_id', playerId)
    .abortSignal(signal)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function getPlayerGames(playerId, limit = 5, signal) {
  const { data, error } = await requireClient()
    .from('player_games')
    .select('*')
    .eq('player_id', playerId)
    .order('game_date', { ascending: false })
    .limit(limit)
    .abortSignal(signal)
  if (error) throw error
  return data
}

export async function searchPlayers(query, limit = 12) {
  const { data, error } = await requireClient()
    .from('player_stats')
    .select('player_id,player_name,team')
    .ilike('player_name', '*' + query.trim() + '*')
    .limit(limit)
  if (error) throw error
  return data
}

export async function getGameHighlights(limit = 20, signal) {
  const { data, error } = await requireClient()
    .from('game_highlights')
    .select('*')
    .neq('youtube_video_id', '__HIDDEN__')
    .order('created_at', { ascending: false })
    .limit(limit)
    .abortSignal(signal)
  if (error) throw error
  return data
}

export async function getMyChangeRequests(userId) {
  const { data, error } = await requireClient()
    .from('profile_change_requests')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getPendingRequests() {
  const { data, error } = await requireClient()
    .from('profile_change_requests')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

export async function getProfilesByIds(ids) {
  if (!ids.length) return []
  const { data, error } = await requireClient()
    .from('user_profiles')
    .select('id,display_name')
    .in('id', ids)
  if (error) throw error
  return data
}

export async function approveChangeRequest(request, reviewerId) {
  if (!['display_name', 'avatar_url'].includes(request.field))
    throw new Error('Unsupported profile field.')
  const { error: e1 } = await requireClient()
    .from('user_profiles')
    .update({ [request.field]: request.new_value })
    .eq('id', request.user_id)
    .select('id')
    .single()
  if (e1) throw e1

  const { error: e2 } = await requireClient()
    .from('profile_change_requests')
    .update({
      status: 'approved',
      reviewed_at: new Date().toISOString(),
      reviewed_by: reviewerId,
    })
    .eq('id', request.id)
    .select('id')
    .single()
  if (e2)
    throw new Error(
      'The profile update succeeded, but the request status could not be saved. Refresh and retry review: ' +
        e2.message,
    )
}

export async function rejectChangeRequest(requestId, reviewerId) {
  const { error } = await requireClient()
    .from('profile_change_requests')
    .update({
      status: 'rejected',
      reviewed_at: new Date().toISOString(),
      reviewed_by: reviewerId,
    })
    .eq('id', requestId)
    .select('id')
    .single()
  if (error) throw error
}

export async function updateMyProfile(userId, updates) {
  if (
    !Object.keys(updates).every((key) =>
      ['display_name', 'avatar_url', 'bio'].includes(key),
    )
  )
    throw new Error('Unsupported profile update.')
  const { data, error } = await requireClient()
    .from('user_profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function createChangeRequest(userId, field, newValue) {
  if (!['display_name', 'avatar_url'].includes(field))
    throw new Error('Unsupported profile field.')
  const { data, error } = await requireClient()
    .from('profile_change_requests')
    .insert({ user_id: userId, field, new_value: newValue })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getFeaturedConfig() {
  const { data: rows, error } = await requireClient()
    .from('featured_players')
    .select('*')
    .order('display_order', { ascending: true })
  if (error) throw error
  if (!rows.length) return []
  const ids = rows.map((r) => r.player_id)
  const { data: players, error: e2 } = await requireClient()
    .from('player_stats')
    .select('player_id,player_name,team,position')
    .in('player_id', ids)
  if (e2)
    throw new Error(
      'The profile update succeeded, but the request status could not be saved. Refresh and retry review: ' +
        e2.message,
    )
  const byId = Object.fromEntries(players.map((p) => [p.player_id, p]))
  return rows.map((r) => ({ ...r, player: byId[r.player_id] || null }))
}

export async function getActiveFeaturedPlayers() {
  const { data: rows, error } = await requireClient()
    .from('featured_players')
    .select('player_id,display_order')
    .eq('active', true)
    .order('display_order', { ascending: true })
  if (error) throw error
  if (!rows.length) return []
  const ids = rows.map((r) => r.player_id)
  const { data: players, error: e2 } = await requireClient()
    .from('player_stats')
    .select('player_id,player_name,team,position')
    .in('player_id', ids)
  if (e2)
    throw new Error(
      'The profile update succeeded, but the request status could not be saved. Refresh and retry review: ' +
        e2.message,
    )
  const byId = Object.fromEntries(players.map((p) => [p.player_id, p]))
  return rows.map((r) => byId[r.player_id]).filter(Boolean)
}

export async function addFeaturedPlayer(playerId, displayOrder) {
  const { error } = await requireClient()
    .from('featured_players')
    .insert({ player_id: playerId, display_order: displayOrder, active: true })
  if (error) throw error
}

export async function removeFeaturedPlayer(id) {
  const { error } = await requireClient()
    .from('featured_players')
    .delete()
    .eq('id', id)
    .select('id')
    .single()
  if (error) throw error
}

export async function updateFeaturedPlayer(id, updates) {
  const { data, error } = await requireClient()
    .from('featured_players')
    .update(updates)
    .eq('id', id)
    .select()
  if (error) throw error
  if (!data || data.length === 0) {
    throw new Error(
      'Update blocked — your account may not have admin permissions.',
    )
  }
}

export async function getLiveGames(fromDate, toDate, signal) {
  let q = requireClient()
    .from('live_games')
    .select('*')
    .order('game_id', { ascending: true })
  if (fromDate) q = q.gte('game_date', fromDate)
  if (toDate) q = q.lt('game_date', toDate)
  const { data, error } = await q.abortSignal(signal)
  if (error) throw error
  return data
}

// Fetch every page; Supabase may cap responses at 1,000 rows.
export async function getPlayerDirectory(signal) {
  const client = requireClient()
  const players = []
  const pageSize = 500
  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await client
      .from('player_stats')
      .select('*')
      .order('player_id')
      .range(offset, offset + pageSize - 1)
      .abortSignal(signal)
    if (error) throw error
    players.push(...(data || []))
    if (!data || data.length < pageSize) break
  }
  return players
}

// Extended feature contracts retained from the newer team implementation.
export async function getFeaturedSelection(signal) {
  const { data, error } = await requireClient()
    .from('featured_players')
    .select('player_id,display_order')
    .eq('active', true)
    .order('display_order')
    .abortSignal(signal)
  if (error) throw error
  return data || []
}
export async function getStandings(signal) {
  const { data, error } = await requireClient()
    .from('nba_standings')
    .select('*')
    .order('conference')
    .order('rank')
    .abortSignal(signal)
  if (error) throw error
  return data || []
}
export async function getTeamRoster(teamId, season, signal) {
  const { data, error } = await requireClient()
    .from('nba_team_rosters')
    .select('*')
    .eq('team_id', teamId)
    .eq('season', season)
    .order('player_name')
    .abortSignal(signal)
  if (error) throw error
  return data || []
}
export async function getPublicProfile(id, signal) {
  const { data, error } = await requireClient()
    .from('user_profiles')
    .select('id,display_name,avatar_url,bio,created_at')
    .eq('id', id)
    .abortSignal(signal)
    .maybeSingle()
  if (error) throw error
  return data
}
export async function getGamePredictions(ids, signal) {
  if (!ids.length) return []
  const { data, error } = await requireClient()
    .from('game_predictions')
    .select('*')
    .in('game_id', ids)
    .abortSignal(signal)
  if (error) throw error
  return data || []
}
export async function getChatMessages(gameId, signal) {
  const { data, error } = await requireClient()
    .from('chat_messages')
    .select('*')
    .eq('game_id', String(gameId))
    .order('created_at', { ascending: false })
    .limit(50)
    .abortSignal(signal)
  if (error) throw error
  return (data || []).reverse()
}
export async function postChatMessage(gameId, body) {
  const client = requireClient()
  const {
    data: { user },
    error: authError,
  } = await client.auth.getUser()
  if (authError || !user) throw new Error('Log in to join the conversation.')
  const trimmed = String(body || '').trim()
  if (!trimmed || trimmed.length > 500)
    throw new Error('Messages must contain 1–500 characters.')
  const { data, error } = await client
    .from('chat_messages')
    .insert({ game_id: String(gameId), user_id: user.id, body: trimmed })
    .select()
    .single()
  if (error) throw error
  return data
}
export function subscribeChatMessages(gameId, onChange, onStatus) {
  const client = requireClient()
  const channel = client
    .channel('stax-chat:' + gameId)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'chat_messages',
        filter: 'game_id=eq.' + gameId,
      },
      onChange,
    )
    .subscribe(onStatus)
  return () => client.removeChannel(channel)
}
export async function deleteChatMessage(id) {
  const { data, error } = await requireClient()
    .from('chat_messages')
    .delete()
    .eq('id', id)
    .select('id')
  if (error) throw error
  if (!data?.length)
    throw new Error('Message was not removed. Check account permissions.')
}
export async function deleteLiveGame(id) {
  const { data, error } = await requireClient()
    .from('live_games')
    .delete()
    .eq('game_id', String(id))
    .select('game_id')
  if (error) throw error
  if (!data?.length)
    throw new Error('Game was not removed. Check account permissions.')
}
export async function upsertHighlight(row) {
  const { data, error } = await requireClient()
    .from('game_highlights')
    .upsert(row, { onConflict: 'game_id' })
    .select()
    .single()
  if (error) throw error
  return data
}
export async function hideHighlight(row) {
  return upsertHighlight({
    game_id: String(row.game_id),
    home_team: row.home_team || '',
    away_team: row.away_team || '',
    youtube_video_id: '__HIDDEN__',
    video_title: 'hidden by admin',
    thumbnail_url: '',
  })
}
export async function requestAnalysis(path, body, signal) {
  const client = requireClient()
  const {
    data: { session },
  } = await client.auth.getSession()
  const response = await fetch('/api/' + path, {
    method: body ? 'POST' : 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(session?.access_token
        ? { Authorization: 'Bearer ' + session.access_token }
        : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
    signal,
  })
  const result = await response
    .json()
    .catch(() => ({ error: 'The API returned an invalid response.' }))
  if (!response.ok)
    throw new Error(result.error || 'The request could not be completed.')
  return result
}

export async function reorderFeaturedPlayers(a, b) {
  const rows = [
    {
      id: a.id,
      player_id: a.player_id,
      display_order: b.display_order,
      active: a.active,
    },
    {
      id: b.id,
      player_id: b.player_id,
      display_order: a.display_order,
      active: b.active,
    },
  ]
  const { data, error } = await requireClient()
    .from('featured_players')
    .upsert(rows, { onConflict: 'id' })
    .select('id')
  if (error) throw error
  if (data?.length !== 2)
    throw new Error('The reorder could not be verified. Refresh the lineup.')
}
