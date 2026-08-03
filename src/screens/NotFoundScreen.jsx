import { Link } from 'react-router-dom'
import { Button, Container } from '../components/ui'

/** 404 — full-bleed midnight with the gold wordmark accent; CTA back to shop. */
function NotFoundScreen() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="font-display text-7xl font-black tracking-tighter text-[var(--color-primary)] nums">404</p>
      <h1 className="mt-4 font-display text-2xl font-bold text-[var(--color-text)]">This page took a different exit</h1>
      <p className="mt-2 max-w-sm text-sm text-[var(--color-text-muted)]">The link may be broken or the page may have moved. Let's get you back to the showroom.</p>
      <Button asChild className="mt-6"><Link to="/shop">Back to shop</Link></Button>
    </Container>
  )
}

export { NotFoundScreen }
