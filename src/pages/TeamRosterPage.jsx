import { Link, useParams, useSearchParams } from 'react-router-dom'
import { getPlayerDirectory, getTeamRoster } from '../lib/api'
import {
  getTeamIdentityFromSlug,
  teamNameToSlug,
  formatTeamLabel,
} from '../lib/teamBranding'
import { resolveNbaFranchiseId } from '../lib/nbaTeamIds'
import { currentNbaSeasonSlug } from '../lib/nbaSeason'
import useResource from '../hooks/useResource'
import PageHeading from '../components/common/PageHeading'
import FeedState from '../components/common/FeedState'
import FeaturedPlayerCard from '../components/home/FeaturedPlayerCard'
export default function TeamRosterPage() {
  const { teamSlug } = useParams(),
    [params] = useSearchParams()
  const season = /^20\d\d-\d\d$/.test(params.get('season') || '')
    ? params.get('season')
    : import.meta.env.VITE_NBA_SEASON || currentNbaSeasonSlug()
  const directory = useResource(getPlayerDirectory)
  const identity = getTeamIdentityFromSlug(teamSlug, []) || {
    canonicalName: directory.data?.find(
      (player) =>
        teamNameToSlug(formatTeamLabel(player.team) || player.team) ===
        teamSlug,
    )?.team,
  }
  const team = identity?.canonicalName
  const teamId = resolveNbaFranchiseId(team)
  const roster = useResource(
    (signal) =>
      teamId ? getTeamRoster(teamId, season, signal) : Promise.resolve([]),
    [teamId, season],
  )
  const indexed = Object.fromEntries(
    (directory.data || []).map((player) => [String(player.player_id), player]),
  )
  const official = roster.data || []
  const fallback = (directory.data || []).filter(
    (player) =>
      teamNameToSlug(formatTeamLabel(player.team) || player.team) ===
        teamSlug || formatTeamLabel(player.team) === team,
  )
  const players = official.length
    ? official.map((row) => ({
        ...indexed[String(row.player_id)],
        ...row,
        team,
        ppg: indexed[String(row.player_id)]?.ppg,
        rpg: indexed[String(row.player_id)]?.rpg,
        apg: indexed[String(row.player_id)]?.apg,
      }))
    : fallback
  return (
    <main className="container">
      <PageHeading
        eyebrow="TEAM ROSTER"
        title={team || 'Team roster'}
        action={
          <Link className="btn-ghost" to="/standings">
            ← Standings
          </Link>
        }
      >
        Roster season {season}. Player averages retain the season supplied by
        the stats feed.
      </PageHeading>
      {directory.loading || roster.loading ? (
        <FeedState loading />
      ) : directory.error && !official.length ? (
        <FeedState {...directory} />
      ) : !team ? (
        <FeedState title="Unknown team">
          <Link to="/standings">Choose a team from the standings →</Link>
        </FeedState>
      ) : (
        <>
          {!official.length && (
            <p className="notice">
              {roster.error
                ? 'The season roster service is unavailable.'
                : 'No season roster records were returned.'}{' '}
              Showing {fallback.length} matching players from the player
              directory; this may not be the complete {season} roster.
            </p>
          )}
          {players.length ? (
            <div className="player-grid">
              {players.map((player) => (
                <FeaturedPlayerCard player={player} key={player.player_id} />
              ))}
            </div>
          ) : (
            <FeedState title="No roster records available">
              Try another season or check the connected roster feed.
            </FeedState>
          )}
        </>
      )}
    </main>
  )
}
