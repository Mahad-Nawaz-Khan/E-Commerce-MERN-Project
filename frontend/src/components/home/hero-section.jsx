import { Link } from 'react-router-dom'
import { Button, Container, Price, Skeleton } from '../ui'
import { useProducts, useCountdown, useStableTarget } from '../../hooks'

/** Signature hero — a featured drop on a midnight stage with a gold hairline + countdown. */
export function HeroSection() {
  const { featured, isLoading } = useProducts()
  const drop = featured[0]
  const target = useStableTarget(2 * 24 * 60 * 60 * 1000) // 2 days
  const t = useCountdown(target)

  if (isLoading && !drop) {
    return (
      <section className="border-b border-[var(--color-border)] bg-[var(--color-bg)]">
        <Container className="grid items-center gap-8 py-12 lg:grid-cols-2 lg:py-20">
          <div className="order-2 lg:order-1 space-y-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-5 w-1/2" />
            <div className="flex gap-4 pt-2">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-36" />
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <Skeleton className="mx-auto aspect-square max-w-md w-full rounded-lg" />
          </div>
        </Container>
      </section>
    )
  }

  if (!drop) return null
  return (
    <section className="border-b border-[var(--color-border)] bg-[var(--color-bg)]">
      <Container className="grid items-center gap-8 py-12 lg:grid-cols-2 lg:py-20">
        <div className="order-2 lg:order-1">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[var(--color-primary)]">
            <span className="h-px w-6 bg-[var(--color-primary)]" /> Featured Drop
          </p>
          <h1 className="mt-3 font-display text-4xl font-black leading-[1.05] tracking-tight text-[var(--color-text)] sm:text-5xl lg:text-6xl">{drop.name}</h1>
          <p className="mt-4 max-w-md text-sm text-[var(--color-text-muted)]">Showcased this week only. Premium build, limited stock — engineered to stand out.</p>
          <div className="mt-6 flex items-center gap-4">
            <Price price={drop.price} originalPrice={drop.originalPrice} size="xl" />
            <Button asChild size="lg"><Link to={`/product/${drop.slug}`}>Shop the drop</Link></Button>
          </div>
          <div className="mt-8 flex gap-4">
            {[['Days', t.days], ['Hrs', t.hours], ['Min', t.minutes], ['Sec', t.seconds]].map(([label, val]) => (
              <div key={label} className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-center">
                <p className="font-display text-2xl font-bold nums text-[var(--color-text)]">{String(val).padStart(2, '0')}</p>
                <p className="text-[10px] uppercase tracking-wide text-[var(--color-text-subtle)]">{label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="order-1 lg:order-2">
          <div className="relative mx-auto aspect-square max-w-md rounded-lg border border-[var(--color-primary)]/40 bg-[var(--color-surface)] p-2 shadow-[var(--shadow-card)]">
            <div className="absolute inset-2 rounded-md border border-[var(--color-primary)]/20" />
            <img src={drop.image} alt={drop.name} className="relative h-full w-full rounded-md object-cover" />
          </div>
        </div>
      </Container>
    </section>
  )
}
