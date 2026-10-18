import test from 'node:test'
import assert from 'node:assert/strict'
import { createApiHandler } from '../server/handlers.js'
import { generateAnalysis } from '../server/services.js'
const games = Array.from({ length: 40 }, (_, i) => ({
  game_id: String(i),
  game_date: new Date(Date.UTC(2025, 9, 1 + i)).toISOString(),
  pts: 20 + (i % 5),
  min: 30,
}))
function clientFactory(_env, token) {
  return {
    auth: {
      getUser: async () => ({
        data: { user: token === 'valid' ? { id: 'test-user' } : null },
        error: token === 'valid' ? null : new Error('invalid'),
      }),
    },
    from(table) {
      const state = { ids: [] }
      const response = () => ({
        data:
          table === 'player_games'
            ? games
            : table === 'player_stats'
              ? state.ids.length
                ? state.ids.map((id) => ({
                    player_id: id,
                    player_name: 'Database ' + id,
                    ppg: 20,
                  }))
                : state.id === 'missing'
                  ? null
                  : { player_id: state.id, player_name: 'Database player' }
              : table === 'game_predictions'
                ? {
                    game_id: '1',
                    prediction: 'home',
                    rationale: 'Fixture rationale',
                  }
                : [],
        error: null,
      })
      const chain = {
        select() {
          return chain
        },
        eq(_field, id) {
          state.id = id
          return chain
        },
        in(_field, ids) {
          state.ids = ids
          return chain
        },
        order() {
          return chain
        },
        limit() {
          return chain
        },
        maybeSingle() {
          return Promise.resolve(response())
        },
        then(resolve, reject) {
          return Promise.resolve(response()).then(resolve, reject)
        },
      }
      return chain
    },
  }
}
const request = (path, body, token) =>
  new Request('http://stax.local' + path, {
    method: body === undefined ? 'GET' : 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: 'Bearer ' + token } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  })
test('prediction API returns model output and handles rewritten deployment paths', async () => {
  const handle = createApiHandler({ clientFactory })
  const response = await handle(request('/api/player-prediction?player_id=1'))
  assert.equal(response.status, 200)
  assert.equal((await response.json()).status, 'ready')
  const rewritten = await handle(
    request('/api?_route=player-prediction&player_id=2'),
  )
  assert.equal(rewritten.status, 200)
  assert.equal((await rewritten.json()).player_id, '2')
  assert.equal(
    (await handle(request('/api/player-prediction?player_id=missing'))).status,
    404,
  )
  assert.equal(
    (await handle(request('/api/player-prediction?player_id=bad%20id'))).status,
    400,
  )
})
test('AI endpoints require a verified session and validate payloads', async () => {
  const handle = createApiHandler({
    clientFactory,
    explain: async () => 'Fixture explanation',
  })
  assert.equal(
    (await handle(request('/api/compare-analysis', { player_ids: ['1', '2'] })))
      .status,
    401,
  )
  assert.equal(
    (
      await handle(
        request('/api/compare-analysis', { player_ids: ['1', '2'] }, 'invalid'),
      )
    ).status,
    401,
  )
  assert.equal(
    (
      await handle(
        request('/api/compare-analysis', { player_ids: ['1'] }, 'valid'),
      )
    ).status,
    400,
  )
  assert.equal(
    (
      await handle(
        request(
          '/api/ask-prediction',
          { game_id: '1', question: 'x'.repeat(501) },
          'valid',
        ),
      )
    ).status,
    400,
  )
  assert.equal(
    (await handle(request('/api/compare-analysis', null, 'valid'))).status,
    400,
  )
})
test('AI analysis uses database stats instead of browser-supplied claims', async () => {
  let supplied = ''
  const handle = createApiHandler({
    clientFactory,
    explain: async (prompt) => {
      supplied = prompt
      return 'Grounded analysis'
    },
  })
  const result = await handle(
    request(
      '/api/compare-analysis',
      {
        player_ids: ['1', '2'],
        players: [{ player_name: 'Invented scoring leader', ppg: 999 }],
      },
      'valid',
    ),
  )
  assert.equal(result.status, 200)
  assert.match(supplied, /Database 1/)
  assert.doesNotMatch(supplied, /999|Invented/)
})
test('production client reads player records through Supabase SDK and returns a projection', async (t) => {
  const requested = []
  t.mock.method(globalThis, 'fetch', async (input) => {
    const url = new URL(String(input))
    requested.push(url)
    return Response.json(
      url.pathname.endsWith('/player_games')
        ? games
        : { player_id: 'sdk-test', player_name: 'SDK test' },
    )
  })
  const handle = createApiHandler({
    env: {
      SUPABASE_URL: 'https://fixture.supabase.co',
      SUPABASE_PUBLISHABLE_KEY: 'public-fixture-key',
    },
  })
  const response = await handle(
    request('/api/player-prediction?player_id=sdk-test'),
  )
  assert.equal(response.status, 200)
  assert.equal((await response.json()).status, 'ready')
  assert.ok(
    requested.some(
      (url) =>
        url.pathname.endsWith('/player_games') &&
        url.searchParams.get('player_id') === 'eq.sdk-test',
    ),
  )
})
test('AI SDK adapter returns text from an intercepted provider response without contacting a provider', async (t) => {
  t.mock.method(globalThis, 'fetch', async (_input, options) => {
    const body = JSON.parse(options.body)
    assert.equal(body.model, 'fixture-model')
    return Response.json({
      id: 'fixture',
      object: 'chat.completion',
      created: 0,
      model: 'fixture-model',
      choices: [
        {
          index: 0,
          message: { role: 'assistant', content: 'Fixture analysis' },
          finish_reason: 'stop',
        },
      ],
      usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 },
    })
  })
  assert.equal(
    await generateAnalysis('Fixture prompt', {
      DEEPSEEK_API_KEY: 'not-a-real-key',
      DEEPSEEK_MODEL: 'fixture-model',
    }),
    'Fixture analysis',
  )
})
test('missing credentials fail explicitly and privileged keys cannot initialize public data service', async () => {
  const handle = createApiHandler({ env: {} })
  assert.equal(
    (await handle(request('/api/player-prediction?player_id=1'))).status,
    503,
  )
  const privileged = createApiHandler({
    env: {
      SUPABASE_URL: 'https://fixture.supabase.co',
      SUPABASE_PUBLISHABLE_KEY: 'sb_secret_example',
    },
  })
  assert.equal(
    (await privileged(request('/api/player-prediction?player_id=1'))).status,
    503,
  )
  const health = await handle(request('/api/health'))
  assert.equal((await health.json()).data_configured, false)
})
