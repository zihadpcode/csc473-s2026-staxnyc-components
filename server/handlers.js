import { createDataClient, generateAnalysis } from './services.js'
import { buildPlayerPrediction } from './prediction.js'
const idPattern = /^[A-Za-z0-9_-]{1,80}$/
const json = (data, status = 200) =>
  Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } })
const modelCache = new Map()
// Instance-local abuse protection. Hosting must additionally enforce a shared rate limit.
const requests = new Map()
function throttle(id) {
  const now = Date.now()
  for (const [key, bucket] of requests)
    if (bucket.until < now) requests.delete(key)
  const bucket = requests.get(id) || { count: 0, until: now + 60000 }
  if (bucket.count >= 10)
    throw Object.assign(new Error('Too many requests. Please wait a minute.'), {
      status: 429,
    })
  bucket.count++
  requests.set(id, bucket)
}
async function readBody(request) {
  const raw = await request.text()
  if (raw.length > 12000)
    throw Object.assign(new Error('Request too large.'), { status: 413 })
  try {
    const body = JSON.parse(raw)
    if (!body || Array.isArray(body) || typeof body !== 'object')
      throw new Error('body')
    return body
  } catch {
    throw Object.assign(new Error('Invalid JSON request.'), { status: 400 })
  }
}
function cleanStatPlayer(player) {
  return Object.fromEntries(
    [
      'player_id',
      'player_name',
      'team',
      'season',
      'ppg',
      'rpg',
      'apg',
      'fg_pct',
      'spg',
      'bpg',
      'three_pct',
      'ft_pct',
    ].map((key) => [key, player[key] ?? null]),
  )
}
export function createApiHandler({
  clientFactory = createDataClient,
  explain = generateAnalysis,
  env = process.env,
} = {}) {
  return async function handle(request) {
    try {
      const url = new URL(request.url)
      const path = url.searchParams.has('_route')
        ? '/api/' + url.searchParams.get('_route')
        : url.pathname.replace(/\/$/, '')
      if (path === '/api/health')
        return json({
          status: 'ok',
          data_configured: Boolean(
            (env.SUPABASE_URL || env.VITE_SUPABASE_URL) &&
              (env.SUPABASE_PUBLISHABLE_KEY ||
                env.SUPABASE_ANON_KEY ||
                env.VITE_SUPABASE_PUBLISHABLE_KEY ||
                env.VITE_SUPABASE_ANON_KEY ||
                env.VITE_SUPABASE_KEY),
          ),
          ai_configured: Boolean(env.DEEPSEEK_API_KEY && env.DEEPSEEK_MODEL),
        })
      const routes = [
        '/api/player-prediction',
        '/api/compare-analysis',
        '/api/ask-prediction',
      ]
      if (!routes.includes(path))
        return json({ error: 'API route not found.' }, 404)
      if (
        request.method !== (path === '/api/player-prediction' ? 'GET' : 'POST')
      )
        return json({ error: 'Method not allowed.' }, 405)
      const token = request.headers
        .get('authorization')
        ?.match(/^Bearer (.+)$/i)?.[1]
      const client = clientFactory(env, token)
      if (path === '/api/player-prediction') {
        const id = url.searchParams.get('player_id') || ''
        if (!idPattern.test(id))
          return json({ error: 'A valid player_id is required.' }, 400)
        const { data: player, error: playerError } = await client
          .from('player_stats')
          .select('player_id,player_name,season')
          .eq('player_id', id)
          .maybeSingle()
        if (playerError) throw playerError
        if (!player) return json({ error: 'Player not found.' }, 404)
        const { data, error } = await client
          .from('player_games')
          .select('*')
          .eq('player_id', id)
          .order('game_date', { ascending: false })
          .limit(82)
        if (error) throw error
        const games = (data || []).filter(
          (game) =>
            !player.season || !game.season || game.season === player.season,
        )
        const fingerprint = JSON.stringify([
          env.SUPABASE_URL || env.VITE_SUPABASE_URL,
          id,
          games.map((g) => [g.game_id, g.game_date, g.pts, g.min, g.status]),
        ])
        const cached = modelCache.get(fingerprint)
        if (cached && cached.until > Date.now())
          return json({ ...cached.value, player_id: id })
        const result = buildPlayerPrediction(games)
        if (modelCache.size >= 100) modelCache.clear()
        modelCache.set(fingerprint, {
          value: result,
          until: Date.now() + 300000,
        })
        return json({ ...result, player_id: id })
      }
      if (!token)
        return json({ error: 'Log in to request an AI explanation.' }, 401)
      const { data: auth, error: authError } = await client.auth.getUser(token)
      if (authError || !auth?.user)
        return json(
          { error: 'Your session could not be verified. Log in again.' },
          401,
        )
      throttle(auth.user.id)
      const body = await readBody(request)
      if (path === '/api/compare-analysis') {
        const ids = [
          ...new Set(Array.isArray(body.player_ids) ? body.player_ids : []),
        ]
        if (
          ids.length < 2 ||
          ids.length > 4 ||
          !ids.every((id) => typeof id === 'string' && idPattern.test(id))
        )
          return json({ error: 'Choose two to four valid player IDs.' }, 400)
        const { data, error } = await client
          .from('player_stats')
          .select('*')
          .in('player_id', ids)
        if (error) throw error
        if (data?.length !== ids.length)
          return json({ error: 'Some selected players are unavailable.' }, 404)
        return json({
          analysis: await explain(
            'Compare these season statistics. Mention ties and missing values. Do not infer defensive ability solely from steals or blocks.\n' +
              JSON.stringify(data.map(cleanStatPlayer)),
            env,
          ),
        })
      }
      if (
        !idPattern.test(String(body.game_id || '')) ||
        typeof body.question !== 'string' ||
        !body.question.trim() ||
        body.question.length > 500
      )
        return json(
          {
            error:
              'A game and a question of up to 500 characters are required.',
          },
          400,
        )
      const { data: prediction, error } = await client
        .from('game_predictions')
        .select('*')
        .eq('game_id', String(body.game_id))
        .maybeSingle()
      if (error) throw error
      if (!prediction)
        return json(
          { error: 'No model prediction is available for this game.' },
          404,
        )
      return json({
        answer: await explain(
          'Explain only this stored prediction. Identify it as a prediction, never a guaranteed result.\n' +
            JSON.stringify({ prediction, question: body.question.trim() }),
          env,
        ),
      })
    } catch (error) {
      const status = error.status || 502
      return json(
        {
          error: error.status
            ? error.message
            : 'The connected service could not complete this request. Please try again.',
        },
        status,
      )
    }
  }
}
export const handleApi = createApiHandler()
