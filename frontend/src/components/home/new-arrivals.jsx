import { Link } from 'react-router-dom'
import { Section, Container } from '../ui'
import { useProducts } from '../../hooks'
import { cn } from '../../lib/cn'

/** New arrivals — large promo cards built from `new`-tagged products, hover-zoom, "Shop now". */
export function NewArrivals() {
  const { newArrivals, isLoading } = useProducts()
  const fresh = newArrivals.slice(0, 2)
  if (isLoading || fresh.length === 0) return null
  return (
    <Section className="py-12 sm:py-16">
      <Container>
        <div className="mb-6 flex items-center gap-3">
          <span className="h-6 w-1.5 rounded-sm bg-[var(--color-primary)]" />
          <h2 className="font-display text-2xl font-bold text-[var(--color-text)] sm:text-3xl">New arrivals</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {fresh.map((p, i) => (
            <Link key={p.id} to={`/product/${p.slug}`}
              className={cn('group relative flex aspect-[4/3] overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]', i === 0 && 'sm:aspect-auto')}>
              <img src={p.image} alt={p.name} loading="lazy"
                className="absolute inset-0 h-full w-full object-cover opacity-80 transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg)] via-[var(--color-bg)]/40 to-transparent" />
              <div className="relative z-10 mt-auto p-6">
                <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-primary)]">Just landed</p>
                <h3 className="mt-1 font-display text-xl font-bold text-[var(--color-text)] sm:text-2xl">{p.name}</h3>
                <span className="mt-3 inline-flex h-9 items-center rounded-md bg-[var(--color-primary)] px-4 text-sm font-medium text-[var(--color-on-primary)] opacity-0 transition-opacity group-hover:opacity-100">
                  Shop now
                </span>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </Section>
  )
}
