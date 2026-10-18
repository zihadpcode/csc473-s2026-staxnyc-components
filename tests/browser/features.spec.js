import { test, expect } from '@playwright/test'
import { mockFeed, mockAccount, mockGame, fixtureGame } from './fixtures'

test('homepage honors curated order and keyboard player search opens a profile', async ({
  page,
}) => {
  await mockFeed(page)
  await page.route('**/rest/v1/featured_players*', (route) =>
    route.fulfill({
      json: [
        { player_id: 3, display_order: 1 },
        { player_id: 1, display_order: 2 },
      ],
    }),
  )
  await page.goto('/')
  const featured = page.getByRole('region', { name: 'Featured lineup' })
  await expect(featured.locator('.player-tile')).toHaveCount(2)
  await expect(featured.locator('.player-tile').first()).toContainText(
    'Test Gamma',
  )
  await page.getByRole('combobox', { name: 'Search any player' }).fill('Alpha')
  await expect(
    page.getByRole('option', { name: 'Test Alpha Team A' }),
  ).toBeVisible()
  await page
    .getByRole('combobox', { name: 'Search any player' })
    .press('ArrowDown')
  await page.getByRole('combobox', { name: 'Search any player' }).press('Enter')
  await expect(page).toHaveURL('/player/1')
})
test('player projection, historical error, ten logs, and line-chart metric selection render', async ({
  page,
}) => {
  await mockFeed(page)
  await page.route('**/rest/v1/player_games?**', (route) =>
    route.fulfill({
      json: Array.from({ length: 10 }, (_, i) => ({
        game_id: i,
        game_date: '2026-10-' + String(10 - i).padStart(2, '0'),
        pts: 20 + i,
        reb: i,
        ast: i + 2,
        opponent: 'Fixture',
        result: 'W',
      })),
    }),
  )
  await page.route('**/api/player-prediction?*', (route) =>
    route.fulfill({
      json: {
        status: 'ready',
        projected_points: 24,
        recent_average: 23,
        range: { low: 17, high: 31 },
        validation_mae: 4.2,
        validation_samples: 8,
        training_samples: 30,
        outperforms_baseline: true,
        last_game_date: '2026-10-10',
        method: 'Fixture regression',
        caveat: 'Not a calibrated confidence interval.',
      },
    }),
  )
  await page.goto('/player/1')
  await expect(
    page.getByText('Historical error range: 17.0–31.0'),
  ).toBeVisible()
  await expect(
    page.getByRole('img', { name: 'Points trend across 10 games' }),
  ).toBeVisible()
  await page.getByRole('combobox', { name: 'Metric' }).selectOption('reb')
  await expect(
    page.getByRole('img', { name: 'Rebounds trend across 10 games' }),
  ).toBeVisible()
  await expect(page.locator('tbody tr')).toHaveCount(10)
})
test('connected standings open an official team roster', async ({ page }) => {
  await mockFeed(page)
  await page.route('**/rest/v1/nba_standings?**', (route) =>
    route.fulfill({
      json: [
        {
          team: 'New York Knicks',
          conference: 'East',
          rank: 1,
          wins: 4,
          losses: 1,
          pct: 0.8,
          gb: 0,
          streak: 'W2',
          last10: '4-1',
          season: 'Fixture season',
          updated_at: '2026-10-18T10:00:00Z',
        },
      ],
    }),
  )
  await page.route('**/rest/v1/nba_team_rosters?**', (route) =>
    route.fulfill({
      json: [{ player_id: 1, player_name: 'Test Alpha', position: 'G' }],
    }),
  )
  await page.goto('/standings')
  await expect(
    page.getByText('Connected standings feed', { exact: false }),
  ).toBeVisible()
  await page
    .getByRole('link', { name: 'New York Knicks', exact: false })
    .click()
  await expect(page).toHaveURL(/\/team\/.*\/roster/)
  await expect(
    page.getByRole('heading', { name: 'New York Knicks' }),
  ).toBeVisible()
  await expect(page.locator('.player-tile')).toHaveCount(1)
})
test('comparison supports custom colors, defensive stats and deterministic insights', async ({
  page,
}) => {
  await mockFeed(page)
  await page.goto('/compare?players=1,2')
  const color = page.getByLabel('Chart color for Test Alpha')
  await color.fill('#ff0000')
  await expect(page.locator('svg polygon[stroke="#ff0000"]')).toHaveCount(1)
  await expect(page.getByRole('table')).toContainText('Steals per game')
  await expect(
    page.getByRole('heading', { name: 'Comparison insights' }),
  ).toBeVisible()
  await expect(
    page.getByText('Points per game: Test Beta leads at 25.0.'),
  ).toBeVisible()
})
test('authenticated game chat sends through the existing contract and links to a public profile', async ({
  page,
}) => {
  await mockFeed(page)
  const { user } = await mockAccount(page)
  await mockGame(page)
  const rows = [
    {
      id: 1,
      game_id: 10,
      user_id: user.id,
      body: 'Fixture opening message',
      created_at: '2026-10-18T10:00:00Z',
    },
  ]
  await page.routeWebSocket(/\/realtime\/v1\/websocket/, (ws) =>
    ws.onMessage(() => {}),
  )
  await page.route('**/rest/v1/chat_messages?**', async (route) => {
    if (route.request().method() === 'POST') {
      const payload = route.request().postDataJSON()
      expect(payload.user_id).toBe(user.id)
      expect(payload.game_id).toBe('10')
      const message = { id: 2, ...payload, created_at: '2026-10-18T10:01:00Z' }
      rows.push(message)
      return route.fulfill({ json: message })
    }
    return route.fulfill({ json: rows })
  })
  await page.goto('/live-games')
  await page.getByRole('button', { name: 'Join live chat' }).click()
  await expect(page.getByText('Fixture opening message')).toBeVisible()
  await page.getByLabel('Your message').fill('Fixture reply')
  await page.getByRole('button', { name: 'Send message' }).click()
  await expect(page.getByText('Fixture reply', { exact: true })).toBeVisible()
  await page.getByRole('link', { name: 'Fixture member' }).first().click()
  await expect(
    page.getByRole('heading', { name: 'Fixture member', exact: true }),
  ).toBeVisible()
  await expect(
    page.getByText('fixture@example.com', { exact: true }),
  ).toHaveCount(0)
})
test('game chat receives a realtime inserted message and dialog closes on Escape', async ({
  page,
}) => {
  await mockFeed(page)
  await mockGame(page)
  let sendEvent,
    joined = false
  await page.routeWebSocket(/\/realtime\/v1\/websocket/, (ws) => {
    ws.onMessage((raw) => {
      const [joinRef, ref, topic, event, payload] = JSON.parse(String(raw))
      if (event === 'phx_join') {
        const filters = payload.config.postgres_changes.map(
          (filter, index) => ({ ...filter, id: index + 1 }),
        )
        ws.send(
          JSON.stringify([
            joinRef,
            ref,
            topic,
            'phx_reply',
            { status: 'ok', response: { postgres_changes: filters } },
          ]),
        )
        joined = true
        sendEvent = (record) =>
          ws.send(
            JSON.stringify([
              joinRef,
              null,
              topic,
              'postgres_changes',
              {
                ids: [1],
                data: {
                  schema: 'public',
                  table: 'chat_messages',
                  commit_timestamp: new Date().toISOString(),
                  type: 'INSERT',
                  record,
                  old_record: {},
                  columns: [],
                },
              },
            ]),
          )
      }
      if (event === 'heartbeat')
        ws.send(
          JSON.stringify([
            joinRef,
            ref,
            topic,
            'phx_reply',
            { status: 'ok', response: {} },
          ]),
        )
    })
  })
  await page.goto('/live-games')
  await page.getByRole('button', { name: 'Join live chat' }).click()
  await expect.poll(() => joined).toBe(true)
  await expect(page.getByText('Live updates connected.')).toBeVisible()
  sendEvent({
    id: 99,
    game_id: 10,
    user_id: 'another-user',
    body: 'Fixture realtime message',
    created_at: new Date().toISOString(),
  })
  await expect(page.getByText('Fixture realtime message')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
})
test('stored game prediction explains through authenticated API and recovers from missing AI configuration', async ({
  page,
}) => {
  await mockFeed(page)
  await mockAccount(page)
  await mockGame(page)
  await page.route('**/api/ask-prediction', (route) =>
    route.fulfill({
      status: 503,
      json: { error: 'AI explanations are not configured.' },
    }),
  )
  await page.goto('/live-games')
  await expect(
    page.getByText('Test Home favored by the stored model', { exact: false }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Ask why?' }).click()
  await page.getByRole('button', { name: 'Ask about this prediction' }).click()
  await expect(page.getByRole('alert')).toContainText(
    'AI explanations are not configured.',
  )
  await page.route('**/api/ask-prediction', (route) =>
    route.fulfill({ json: { answer: 'Fixture grounded explanation' } }),
  )
  await page.getByRole('button', { name: 'Ask about this prediction' }).click()
  await expect(page.getByText('Fixture grounded explanation')).toBeVisible()
})
test('signup profile is created without a client-supplied admin role and bio edits persist', async ({
  page,
}) => {
  await mockFeed(page)
  const account = await mockAccount(page, { missingProfile: true })
  await page.goto('/profile')
  await expect(
    page.getByRole('heading', { name: 'Your Profile' }),
  ).toBeVisible()
  expect(account.getProfile().role).toBe('user')
  await page.getByLabel('Bio', { exact: true }).fill('Fixture edited bio')
  await page.getByRole('button', { name: 'Save bio' }).click()
  await expect(page.getByText('Bio updated.')).toBeVisible()
  expect(account.getProfile().bio).toBe('Fixture edited bio')
  await page.goto('/admin')
  await expect(page.getByRole('heading', { name: 'Admins only' })).toBeVisible()
})
test('password recovery uses the current site redirect and signed-in password update', async ({
  page,
}) => {
  await mockFeed(page)
  let recovery
  await page.route('**/auth/v1/recover?**', (route) => {
    recovery = route.request().url()
    return route.fulfill({ json: {} })
  })
  await page.goto('/forgot-password')
  await page.getByLabel('Email', { exact: true }).fill('fixture@example.com')
  await page.getByRole('button', { name: 'Send recovery link' }).click()
  await expect(
    page.getByText('If this address has an account', { exact: false }),
  ).toBeVisible()
  expect(new URL(recovery).searchParams.get('redirect_to')).toBe(
    'http://127.0.0.1:4176/reset-password',
  )
  await mockAccount(page)
  let updated
  await page.route('**/auth/v1/user', (route) => {
    updated = route.request().postDataJSON()
    return route.fulfill({
      json: {
        id: '11111111-1111-4111-8111-111111111111',
        email: 'fixture@example.com',
      },
    })
  })
  await page.goto('/reset-password')
  await page.getByLabel('New password').fill('unique-fixture-password')
  await page.getByRole('button', { name: 'Save password' }).click()
  await expect(page).toHaveURL('/profile')
  expect(updated.password).toBe('unique-fixture-password')
})
test('admin highlights save valid videos, filter hidden records, and hide with a marker', async ({
  page,
}) => {
  await mockFeed(page)
  await mockAccount(page, { admin: true })
  await mockGame(page)
  let saved
  const highlights = []
  await page.route('**/rest/v1/game_highlights?**', (route) => {
    if (route.request().method() === 'POST') {
      saved = route.request().postDataJSON()
      highlights.splice(
        0,
        highlights.length,
        ...(saved.youtube_video_id === '__HIDDEN__' ? [] : [saved]),
      )
      return route.fulfill({ json: saved })
    }
    expect(
      new URL(route.request().url()).searchParams.get('youtube_video_id'),
    ).toBe('neq.__HIDDEN__')
    return route.fulfill({ json: highlights })
  })
  await page.route('https://www.youtube-nocookie.com/**', (route) =>
    route.fulfill({ contentType: 'text/html', body: 'Fixture video' }),
  )
  await page.goto('/highlights')
  await expect(
    page.getByRole('heading', { name: 'Add or replace a highlight' }),
  ).toBeVisible()
  await page
    .getByRole('combobox', { name: 'Game', exact: true })
    .selectOption('10')
  await page
    .getByLabel('YouTube URL or video ID')
    .fill('https://youtu.be/abcdefghijk')
  await page.getByLabel('Video title').fill('Fixture game highlight')
  await page.getByRole('button', { name: 'Save highlight' }).click()
  await expect(page.getByText('Highlight saved.')).toBeVisible()
  expect(saved.youtube_video_id).toBe('abcdefghijk')
  await expect(page.getByTitle('Fixture game highlight')).toBeVisible()
  page.on('dialog', (dialog) => dialog.accept())
  await page.getByRole('button', { name: 'Hide highlight' }).click()
  await expect(
    page.getByRole('heading', { name: 'No highlights yet' }),
  ).toBeVisible()
  expect(saved.youtube_video_id).toBe('__HIDDEN__')
})
test('mobile additions remain within the viewport and chat focuses inside its dialog', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await mockFeed(page)
  await mockGame(page)
  await page.routeWebSocket(/\/realtime\/v1\/websocket/, (ws) =>
    ws.onMessage(() => {}),
  )
  for (const path of [
    '/',
    '/compare?players=1,2',
    '/player/1',
    '/team/new-york-knicks/roster',
    '/highlights',
    '/forgot-password',
  ]) {
    await page.goto(path)
    await expect(page.locator('main')).toBeVisible()
    await expect
      .poll(() =>
        page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      )
      .toBe(true)
  }
  await page.goto('/live-games')
  await page.getByRole('button', { name: 'Join live chat' }).click()
  await expect
    .poll(() =>
      page.evaluate(() => Boolean(document.activeElement.closest('dialog'))),
    )
    .toBe(true)
  await expect
    .poll(() =>
      page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    )
    .toBe(true)
})

test('admin curates featured players with add, atomic reorder, visibility and removal', async ({
  page,
}) => {
  await mockFeed(page)
  await mockAccount(page, { admin: true })
  const rows = [
    { id: 1, player_id: 1, display_order: 1, active: true },
    { id: 2, player_id: 2, display_order: 2, active: true },
  ]
  let reorder
  await page.route('**/rest/v1/featured_players*', (route) => {
    const method = route.request().method(),
      url = new URL(route.request().url()),
      id = Number(url.searchParams.get('id')?.replace('eq.', ''))
    if (method === 'PATCH') {
      const row = rows.find((row) => row.id === id)
      Object.assign(row, route.request().postDataJSON())
      return route.fulfill({ json: [row] })
    }
    if (method === 'DELETE') {
      const index = rows.findIndex((row) => row.id === id),
        [removed] = rows.splice(index, 1)
      return route.fulfill({ json: removed })
    }
    if (method === 'POST') {
      const data = route.request().postDataJSON()
      if (Array.isArray(data)) {
        reorder = data
        data.forEach((update) =>
          Object.assign(
            rows.find((row) => row.id === update.id),
            update,
          ),
        )
        return route.fulfill({ json: data.map((row) => ({ id: row.id })) })
      }
      const added = { id: 3, ...data }
      rows.push(added)
      return route.fulfill({ status: 201, json: added })
    }
    return route.fulfill({
      json: [...rows].sort((a, b) => a.display_order - b.display_order),
    })
  })
  await page.goto('/admin')
  await page
    .getByRole('button', { name: 'Featured Players', exact: true })
    .click()
  await expect(page.locator('.featured-row')).toHaveCount(2)
  await page
    .getByRole('button', { name: 'Move down', exact: true })
    .first()
    .click()
  await expect(page.locator('.featured-row').first()).toContainText('Test Beta')
  expect(reorder).toHaveLength(2)
  await page
    .locator('.featured-row')
    .first()
    .getByRole('button', { name: 'Hide', exact: true })
    .click()
  await expect(
    page
      .locator('.featured-row')
      .first()
      .getByRole('button', { name: 'Show', exact: true }),
  ).toBeVisible()
  await page.getByRole('button', { name: '+ Add player', exact: true }).click()
  await page.getByLabel('Search players', { exact: true }).fill('Gamma')
  await page
    .getByRole('button', { name: 'Test Gamma Team A', exact: true })
    .click()
  await expect(page.locator('.featured-row')).toHaveCount(3)
  await page
    .locator('.featured-row')
    .last()
    .getByRole('button', { name: 'Remove', exact: true })
    .click()
  await expect(page.locator('.featured-row')).toHaveCount(2)
})
test('admin approves and rejects profile requests, and refuses a role-change request', async ({
  page,
}) => {
  await mockFeed(page)
  await mockAccount(page, { admin: true })
  const rows = [
    {
      id: 1,
      user_id: 'other-user',
      field: 'display_name',
      new_value: 'New fixture name',
      status: 'pending',
      created_at: '2026-10-18T12:00:00Z',
    },
    {
      id: 2,
      user_id: 'other-user',
      field: 'avatar_url',
      new_value: 'https://example.com/avatar.png',
      status: 'pending',
      created_at: '2026-10-18T12:00:00Z',
    },
    {
      id: 3,
      user_id: 'other-user',
      field: 'role',
      new_value: 'admin',
      status: 'pending',
      created_at: '2026-10-18T12:00:00Z',
    },
  ]
  const profileWrites = []
  await page.route('**/rest/v1/user_profiles?**', async (route) => {
    if (route.request().method() === 'PATCH') {
      profileWrites.push(route.request().postDataJSON())
      return route.fulfill({ json: { id: 'other-user' } })
    }
    return route.fallback()
  })
  await page.route('**/rest/v1/profile_change_requests?**', (route) => {
    if (route.request().method() === 'PATCH') {
      const id = Number(
          new URL(route.request().url()).searchParams
            .get('id')
            .replace('eq.', ''),
        ),
        row = rows.find((row) => row.id === id)
      Object.assign(row, route.request().postDataJSON())
      return route.fulfill({ json: { id } })
    }
    return route.fulfill({
      json: rows.filter((row) => row.status === 'pending'),
    })
  })
  await page.goto('/admin')
  await expect(page.locator('.pending-row')).toHaveCount(3)
  await page
    .locator('.pending-row')
    .first()
    .getByRole('button', { name: 'Approve', exact: true })
    .click()
  await expect(page.locator('.pending-row')).toHaveCount(2)
  expect(profileWrites).toEqual([{ display_name: 'New fixture name' }])
  await page
    .locator('.pending-row')
    .first()
    .getByRole('button', { name: 'Reject', exact: true })
    .click()
  await expect(page.locator('.pending-row')).toHaveCount(1)
  await page
    .locator('.pending-row')
    .first()
    .getByRole('button', { name: 'Approve', exact: true })
    .click()
  await expect(
    page.getByText('Unsupported profile field.', { exact: true }),
  ).toBeVisible()
  expect(profileWrites).toHaveLength(1)
})
test('authenticated AI comparison updates without showing analysis for an old selection', async ({
  page,
}) => {
  await mockFeed(page)
  await mockAccount(page)
  await page.route('**/api/compare-analysis', (route) => {
    const body = route.request().postDataJSON()
    expect(body.player_ids).toEqual(['1', '2'])
    expect(route.request().headers().authorization).toMatch(/^Bearer /)
    return route.fulfill({
      json: { analysis: 'Fixture comparison explanation' },
    })
  })
  await page.goto('/compare?players=1,2')
  await page.getByRole('button', { name: 'Explain with AI' }).click()
  await expect(page.getByText('Fixture comparison explanation')).toBeVisible()
  await page
    .getByRole('button', { name: 'Remove Test Alpha', exact: true })
    .click()
  await expect(page.getByText('Fixture comparison explanation')).toHaveCount(0)
})

test('schedule date queries a different day and admin can remove a fixture game', async ({
  page,
}) => {
  await mockFeed(page)
  await mockAccount(page, { admin: true })
  const requested = []
  let removed = false
  await page.route('**/rest/v1/live_games?**', (route) => {
    if (route.request().method() === 'DELETE') {
      removed = true
      return route.fulfill({ json: [{ game_id: 10 }] })
    }
    requested.push(
      new URL(route.request().url()).searchParams.getAll('game_date'),
    )
    return route.fulfill({ json: removed ? [] : [fixtureGame] })
  })
  await page.goto('/live-games')
  await expect(page.getByText('Test Home', { exact: true })).toBeVisible()
  await page.getByLabel('Schedule date').fill('2026-10-20')
  await expect
    .poll(() => requested.some((filters) => filters.includes('gte.2026-10-20')))
    .toBe(true)
  page.on('dialog', (dialog) => dialog.accept())
  await page.getByRole('button', { name: 'Remove game' }).click()
  await expect(
    page.getByRole('heading', { name: 'No games on the schedule' }),
  ).toBeVisible()
  expect(removed).toBe(true)
})

test('updated feature previews and animation demo render without overflow', async ({
  page,
}) => {
  await mockFeed(page)
  await mockAccount(page, { admin: true })
  await mockGame(page)
  await page.routeWebSocket(/\/realtime\/v1\/websocket/, (ws) =>
    ws.onMessage(() => {}),
  )
  await page.route('https://cdn.nba.com/**', (route) => route.abort())
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/compare?players=1,2')
  await expect(
    page.getByRole('heading', { name: 'Comparison insights' }),
  ).toBeVisible()
  await page.screenshot({
    path: 'test-results/staxnyc-compare-upgraded.png',
    fullPage: true,
  })
  await page.goto('/player/1')
  await expect(
    page.getByRole('heading', { name: 'Points projection' }),
  ).toBeVisible()
  await page.screenshot({
    path: 'test-results/staxnyc-player-upgraded.png',
    fullPage: true,
  })
  await page.goto('/live-games')
  await page.getByRole('button', { name: 'Join live chat' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.screenshot({
    path: 'test-results/staxnyc-chat-upgraded.png',
    fullPage: true,
  })
  await page.keyboard.press('Escape')
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/anim-demo')
  await expect(
    page.getByRole('heading', { name: 'Wemby animation preview' }),
  ).toBeVisible()
  await expect
    .poll(() =>
      page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    )
    .toBe(true)
})
