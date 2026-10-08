import { test, expect } from '@playwright/test'
const players = [
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
async function mockFeed(page, { fail = false } = {}) {
  await page.route('https://stax-test.supabase.co/**', async (route) => {
    const url = new URL(route.request().url())
    if (fail)
      return route.fulfill({
        status: 503,
        json: { message: 'Test feed offline' },
      })
    if (url.pathname.endsWith('/player_stats')) {
      const id = url.searchParams.get('player_id')?.replace('eq.', '')
      return route.fulfill({
        json: id ? players.find((p) => String(p.player_id) === id) : players,
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
test('directory filters, sorting and stack survive reload and removal', async ({
  page,
}) => {
  await mockFeed(page)
  await page.goto('/players')
  const cards = page.locator('.player-tile')
  await expect(cards).toHaveCount(3)
  await expect(cards.first()).toContainText('Test Beta')
  await page
    .getByRole('combobox', { name: 'Team', exact: true })
    .selectOption('Team A')
  await expect(cards).toHaveCount(2)
  await page
    .getByRole('combobox', { name: 'Sort by', exact: true })
    .selectOption('apg')
  await expect(cards.first()).toContainText('Test Alpha')
  await page
    .getByRole('button', { name: 'Save Test Alpha', exact: true })
    .click()
  await page.goto('/stack')
  await expect(cards).toHaveCount(1)
  await page.reload()
  await expect(cards).toContainText('Test Alpha')
  await page
    .getByRole('button', { name: 'Remove Test Alpha', exact: true })
    .click()
  await expect(
    page.getByRole('heading', { name: 'Build your first stack' }),
  ).toBeVisible()
})
test('comparison uses profile selection, separate colors, table and bookmark restoration', async ({
  page,
}) => {
  await mockFeed(page)
  await page.goto('/player/1')
  await expect(
    page.getByRole('heading', { name: 'Test Alpha', exact: true }),
  ).toBeVisible()
  await page.getByRole('link', { name: 'Compare player', exact: false }).click()
  await page
    .getByRole('button', { name: 'Test Beta Team B +', exact: true })
    .click()
  await expect(page).toHaveURL(/players=1%2C2/)
  await expect(page.getByRole('table')).toContainText('25.0')
  await page.reload()
  await expect(page.locator('.comparison-player')).toHaveCount(2)
  await page.getByRole('checkbox', { name: 'Show on chart' }).first().uncheck()
  await expect(page.locator('svg polygon[fill-opacity]')).toHaveCount(1)
})
test('failed feeds can recover and do not claim no scheduled games', async ({
  page,
}) => {
  await mockFeed(page, { fail: true })
  await page.goto('/live-games')
  await expect(
    page.getByRole('heading', { name: 'Feed unavailable' }),
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'No games on the schedule' }),
  ).toHaveCount(0)
  await page.unrouteAll()
  await mockFeed(page)
  await page.getByRole('button', { name: 'Try again' }).click()
  await expect(
    page.getByRole('heading', { name: 'No games on the schedule' }),
  ).toBeVisible()
})
test('mobile navigation, standings and comparison do not overflow', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await mockFeed(page)
  await page.goto('/')
  await expect(
    page.getByRole('heading', { name: 'Know the numbers. See the game.' }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Menu', exact: true }).click()
  await expect(page.getByRole('navigation')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('navigation')).not.toBeVisible()
  await page.getByRole('button', { name: 'Menu', exact: true }).click()
  await page.getByRole('link', { name: 'Standings', exact: false }).click()
  await expect(
    page.getByText('Saved repository snapshot', { exact: false }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'West', exact: true }).click()
  await expect(page.getByRole('table')).not.toContainText('Boston Celtics')
  await expect
    .poll(() =>
      page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    )
    .toBe(true)
  await page.goto('/compare?players=1,2')
  await expect(page.locator('.comparison-player')).toHaveCount(2)
  await expect
    .poll(() =>
      page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    )
    .toBe(true)
})
test('all primary pages render without uncaught browser errors', async ({
  page,
}) => {
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  await mockFeed(page)
  for (const path of [
    '/',
    '/players',
    '/stack',
    '/player/1',
    '/compare',
    '/standings',
    '/highlights',
    '/login',
    '/signup',
    '/profile',
    '/admin',
    '/missing',
  ]) {
    await page.goto(path)
    await expect(page.locator('main')).toBeVisible()
  }
  expect(errors).toEqual([])
})
test('desktop and mobile screenshots', async ({ page }) => {
  await mockFeed(page)
  await page.setViewportSize({ width: 1440, height: 1080 })
  await page.goto('/')
  await expect(page.locator('.player-tile')).toHaveCount(3)
  await page.screenshot({
    path: 'test-results/staxnyc-desktop.png',
    fullPage: true,
  })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.screenshot({
    path: 'test-results/staxnyc-mobile.png',
    fullPage: true,
  })
})

test('login sends the entered password and displays a failed account response', async ({
  page,
}) => {
  await mockFeed(page)
  let payload
  await page.route('**/auth/v1/token**', async (route) => {
    payload = route.request().postDataJSON()
    await route.fulfill({
      status: 400,
      json: {
        error: 'invalid_grant',
        error_description: 'Invalid login credentials',
      },
    })
  })
  await page.goto('/login')
  await page.getByLabel('Email', { exact: true }).fill('test@example.com')
  await page
    .getByLabel('Password', { exact: true })
    .fill('unique-test-password')
  await page.getByRole('button', { name: 'Log in', exact: false }).click()
  await expect(page.getByRole('alert')).toContainText(
    'Invalid login credentials',
  )
  expect(payload).toMatchObject({
    email: 'test@example.com',
    password: 'unique-test-password',
  })
})
test('game center retains last successful scores when refresh fails', async ({
  page,
}) => {
  await mockFeed(page)
  await page.route('**/rest/v1/live_games**', (route) =>
    route.fulfill({
      json: [
        {
          game_id: 1,
          status: 'live',
          home_team: 'Test Home',
          away_team: 'Test Away',
          home_score: 42,
          away_score: 35,
          quarter: 'Q2',
        },
      ],
    }),
  )
  await page.goto('/live-games')
  await expect(page.getByText('Test Home', { exact: true })).toBeVisible()
  await page.route('**/rest/v1/live_games**', (route) =>
    route.fulfill({ status: 503, json: { message: 'Test feed offline' } }),
  )
  await page
    .getByRole('button', { name: 'Refresh schedule', exact: false })
    .click()
  await expect(page.getByRole('alert')).toContainText(
    'Showing the last successful feed',
  )
  await expect(page.getByText('Test Home', { exact: true })).toBeVisible()
})
test('unconfigured production build renders, disables accounts, and keeps snapshot navigation working', async ({
  page,
}) => {
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('http://127.0.0.1:4177/')
  await expect(page.getByText('Explore mode', { exact: true })).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Feed unavailable' }),
  ).toBeVisible()
  await page.goto('http://127.0.0.1:4177/login')
  await expect(
    page.getByRole('button', { name: 'Log in', exact: false }),
  ).toBeDisabled()
  await page.goto('http://127.0.0.1:4177/standings')
  await expect(page.getByRole('table')).toContainText('Boston Celtics')
  expect(errors).toEqual([])
})

test('failed roster requests do not mark saved players as removed', async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem('staxnyc:saved-players:v1', '["1"]'),
  )
  await mockFeed(page, { fail: true })
  await page.goto('/stack')
  await expect(
    page.getByRole('heading', { name: 'Feed unavailable' }),
  ).toBeVisible()
  await expect(
    page.getByText('saved players are no longer', { exact: false }),
  ).toHaveCount(0)
  await page.unrouteAll()
  await mockFeed(page)
  await page.getByRole('button', { name: 'Try again' }).click()
  await expect(page.locator('.player-tile')).toHaveCount(1)
})
