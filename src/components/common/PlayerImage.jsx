import { useState } from 'react'
const originals = {
  2544: 'lebron.png',
  202681: 'kyrie.png',
  1629630: 'JaMorant.png',
  201935: 'JamesHarden.png',
}
export default function PlayerImage({ player, className = '' }) {
  const [failed, setFailed] = useState('')
  const source = originals[String(player.player_id)]
    ? '/images/' + originals[String(player.player_id)]
    : /^https:\/\//.test(player.image_url || '')
      ? player.image_url
      : /^\d{4,7}$/.test(String(player.player_id || ''))
        ? 'https://cdn.nba.com/headshots/nba/latest/1040x760/' +
          player.player_id +
          '.png'
        : ''
  return source && failed !== source ? (
    <img
      className={'player-photo ' + className}
      loading="lazy"
      src={source}
      alt={player.player_name}
      onError={() => setFailed(source)}
    />
  ) : (
    <span className={'player-initials ' + className} aria-hidden="true">
      {(player.player_name || '?')
        .split(' ')
        .map((word) => word[0])
        .slice(0, 2)
        .join('')}
    </span>
  )
}
