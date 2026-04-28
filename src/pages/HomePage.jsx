import { useEffect, useState } from 'react'
import PlayerSearchBar from '../components/search/PlayerSearchBar'
import FeaturedPlayerCard from '../components/home/FeaturedPlayerCard'
import { getActiveFeaturedPlayers } from '../lib/api'

const LOCAL_IMAGES = {
  '2544':    '/images/lebron.png',
  '202681':  '/images/kyrie.png',
  '1629630': '/images/JaMorant.png',
  '201935':  '/images/JamesHarden.png',
}

export default function HomePage() {
  const [featured, setFeatured] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const players = await getActiveFeaturedPlayers()
        setFeatured(players.map((p) => ({
          id: p.player_id,
          name: p.player_name,
          team: p.team,
          position: p.position,
          image: LOCAL_IMAGES[p.player_id],
        })))
      } catch (err) {
        console.error('Featured players failed to load:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <main className="container">
      <section className="hero">
        <div className="hero-card">
          <h1>NBA Player Performance Predictor</h1>
          <p>Browse player profiles and live game scores.</p>
          <PlayerSearchBar />
        </div>
      </section>

      <section id="players" className="players-section">
        <h2 className="section-title-home">Featured Players</h2>
        {loading ? (
          <p style={{ color: 'var(--muted)' }}>Loading…</p>
        ) : featured.length === 0 ? (
          <p style={{ color: 'var(--muted)' }}>
            No featured players yet. An admin can add some from the Admin page.
          </p>
        ) : (
          <div className="player-grid">
            {featured.map((p) => <FeaturedPlayerCard key={p.id} player={p} />)}
          </div>
        )}
      </section>

      <footer className="footer">StaxNYC Predictor</footer>
    </main>
  )
}
