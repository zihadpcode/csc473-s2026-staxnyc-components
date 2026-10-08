export default function PageHeading({
  eyebrow = 'THE GAME, IN NUMBERS',
  title,
  children,
  action,
}) {
  return (
    <header className="page-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        {children && <p className="page-description">{children}</p>}
      </div>
      {action}
    </header>
  )
}
