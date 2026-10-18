export default function FeedState({
  loading,
  error,
  title = 'Nothing here yet',
  children,
  retry,
}) {
  return (
    <section className="feed-state card" role={error ? 'alert' : 'status'}>
      <span className="feed-symbol" aria-hidden="true">
        {loading ? '◌' : error ? '↗' : '○'}
      </span>
      <h2>
        {loading ? 'Getting the numbers…' : error ? 'Feed unavailable' : title}
      </h2>
      <p>{error || children}</p>
      {error && retry && (
        <button className="btn primary" onClick={retry}>
          Try again
        </button>
      )}
    </section>
  )
}
