export function parseYouTubeId(input) {
  const raw = String(input || '').trim()
  if (/^[A-Za-z0-9_-]{11}$/.test(raw)) return raw
  try {
    const url = new URL(raw)
    if (url.protocol !== 'https:') return ''
    const host = url.hostname.toLowerCase()
    if (
      ![
        'youtube.com',
        'www.youtube.com',
        'm.youtube.com',
        'youtu.be',
        'www.youtu.be',
        'youtube-nocookie.com',
        'www.youtube-nocookie.com',
      ].includes(host)
    )
      return ''
    const value = host.endsWith('youtu.be')
      ? url.pathname.split('/')[1]
      : url.searchParams.get('v') ||
        url.pathname.match(/^\/(?:embed|shorts)\/([^/]+)/)?.[1]
    return /^[A-Za-z0-9_-]{11}$/.test(value || '') ? value : ''
  } catch {
    return ''
  }
}
