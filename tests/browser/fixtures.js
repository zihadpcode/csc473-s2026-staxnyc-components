export const players = [
  {
    player_id: 1,
    player_name: 'Test Alpha',
    team: 'Team A',
    position: 'G',
    ppg: 10,
    rpg: 4,
    apg: 9,
    fg_pct: 44,
    season: 'Test season',
    games_played: 10,
    mpg: 30,
  },
  {
    player_id: 2,
    player_name: 'Test Beta',
    team: 'Team B',
    position: 'F',
    ppg: 25,
    rpg: 8,
    apg: 4,
    fg_pct: 50,
    season: 'Test season',
    games_played: 12,
    mpg: 32,
  },
  {
    player_id: 3,
    player_name: 'Test Gamma',
    team: 'Team A',
    position: 'C',
    ppg: 15,
    rpg: 10,
    apg: 6,
    fg_pct: 40,
    season: 'Test season',
    games_played: 8,
    mpg: 28,
  },
]
export async function mockFeed(page, { fail = false } = {}) {
  await page.route('**/api/player-prediction?*', (route) =>
    route.fulfill({
      json: {
        status: 'insufficient_data',
        games_available: 1,
        games_required: 20,
        message:
          'At least 20 completed game logs are needed for a validated projection.',
      },
    }),
  )
  await page.route('https://stax-test.supabase.co/**', async (route) => {
    const url = new URL(route.request().url())
    if (fail)
      return route.fulfill({
        status: 503,
        json: { message: 'Test feed offline' },
      })
    if (url.pathname.endsWith('/player_stats')) {
      const filter = url.searchParams.get('player_id')
      const id = filter?.startsWith('eq.') ? filter.slice(3) : null
      const included = filter?.startsWith('in.')
        ? filter
            .slice(4, -1)
            .split(',')
            .map((id) => id.replaceAll('\"', ''))
        : null
      return route.fulfill({
        json: id
          ? players.find((p) => String(p.player_id) === id)
          : players
              .filter(
                (p) => !included || included.includes(String(p.player_id)),
              )
              .filter(
                (p) =>
                  !url.searchParams.get('player_name') ||
                  p.player_name
                    .toLowerCase()
                    .includes(
                      url.searchParams
                        .get('player_name')
                        .replace('ilike.', '')
                        .replaceAll('*', '')
                        .toLowerCase(),
                    ),
              ),
      })
    }
    if (url.pathname.endsWith('/player_games'))
      return route.fulfill({
        json: [
          {
            game_date: '2026-10-01',
            pts: 18,
            reb: 5,
            ast: 6,
            opponent: 'Test opponent',
          },
        ],
      })
    return route.fulfill({ json: [] })
  })
}
export async function mockAccount(
  page,
  { admin = false, missingProfile = false } = {},
) {
  const user = {
    id: '11111111-1111-4111-8111-111111111111',
    aud: 'authenticated',
    role: 'authenticated',
    email: 'fixture@example.com',
    app_metadata: {},
    user_metadata: { display_name: 'Fixture member' },
    created_at: '2026-01-01T00:00:00Z',
  }
  const expires = Math.floor(Date.now() / 1000) + 3600
  const token =
    Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString(
      'base64url',
    ) +
    '.' +
    Buffer.from(
      JSON.stringify({
        sub: user.id,
        role: 'authenticated',
        aud: 'authenticated',
        exp: expires,
      }),
    ).toString('base64url') +
    '.fixture'
  const session = {
    access_token: token,
    refresh_token: 'fixture-refresh',
    expires_in: 3600,
    expires_at: expires,
    token_type: 'bearer',
    user,
  }
  await page.addInitScript(
    (session) =>
      localStorage.setItem('sb-stax-test-auth-token', JSON.stringify(session)),
    session,
  )
  await page.route('**/auth/v1/user', (route) => route.fulfill({ json: user }))
  let profile = missingProfile
    ? null
    : {
        id: user.id,
        display_name: 'Fixture member',
        bio: 'Fixture bio',
        role: admin ? 'admin' : 'user',
        created_at: user.created_at,
      }
  await page.route('**/rest/v1/user_profiles?**', async (route) => {
    const request = route.request(),
      url = new URL(request.url())
    if (request.method() === 'POST') {
      const payload = request.postDataJSON()
      profile = {
        ...payload,
        role: 'user',
        bio: null,
        created_at: user.created_at,
      }
      return route.fulfill({ status: 201, json: [profile] })
    }
    if (request.method() === 'PATCH') {
      profile = { ...profile, ...request.postDataJSON() }
      return route.fulfill({ json: [profile] })
    }
    if (url.searchParams.get('id')?.startsWith('in.'))
      return route.fulfill({ json: profile ? [profile] : [] })
    return route.fulfill({ json: profile })
  })
  return { user, token, getProfile: () => profile }
}
export const fixtureGame = {
  game_id: 10,
  status: 'live',
  home_team: 'Test Home',
  away_team: 'Test Away',
  home_score: 42,
  away_score: 35,
  quarter: 'Q2',
  game_date: '2026-10-18T20:00:00Z',
}
export async function mockGame(page) {
  await page.route('**/rest/v1/live_games?**', (route) =>
    route.fulfill({ json: [fixtureGame] }),
  )
  await page.route('**/rest/v1/game_predictions?**', (route) =>
    route.fulfill({
      json: [
        {
          game_id: 10,
          prediction: 'home',
          home_win_prob: 0.62,
          rationale: 'Fixture model rationale',
        },
      ],
    }),
  )
}
