import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import useResource from '../hooks/useResource'
import { getPublicProfile } from '../lib/api'
import PageHeading from '../components/common/PageHeading'
import FeedState from '../components/common/FeedState'
export default function UserProfilePage() {
  const [avatarFailed, setAvatarFailed] = useState(false)
  const { userId } = useParams(),
    { user } = useAuth()
  const feed = useResource(
    (signal) => getPublicProfile(userId, signal),
    [userId],
  )
  return (
    <main className="container">
      <PageHeading
        eyebrow="STAX COMMUNITY"
        title={feed.data?.display_name || 'Public profile'}
        action={
          user?.id === userId ? (
            <Link className="btn primary" to="/profile">
              Edit your profile
            </Link>
          ) : null
        }
      />
      {feed.loading || feed.error ? (
        <FeedState {...feed} />
      ) : !feed.data ? (
        <FeedState title="Profile not found">
          This user has no available public profile.
        </FeedState>
      ) : (
        <section className="card panel public-profile">
          <div className="public-avatar">
            {!avatarFailed && /^https:\/\//.test(feed.data.avatar_url || '') ? (
              <img
                src={feed.data.avatar_url}
                alt={feed.data.display_name || 'User avatar'}
                onError={() => setAvatarFailed(true)}
              />
            ) : (
              feed.data.display_name?.[0] || '?'
            )}
          </div>
          <div>
            <h2>About this member</h2>
            <p className="muted">{feed.data.bio || 'No bio added yet.'}</p>
            {feed.data.created_at && (
              <p className="muted">
                Joined{' '}
                {new Date(feed.data.created_at).toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            )}
          </div>
        </section>
      )}
    </main>
  )
}
