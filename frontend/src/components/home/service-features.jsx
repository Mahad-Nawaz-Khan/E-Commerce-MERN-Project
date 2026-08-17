import { Section, Container } from '../ui'
import { Truck, Headphones, ShieldCheck, CreditCard } from 'lucide-react'

const defaultFeatures = [
  { icon: Truck, title: 'Free Delivery', body: 'On orders over the free-ship threshold.' },
  { icon: Headphones, title: '24/7 Service', body: 'Real humans, ready when you need them.' },
  { icon: ShieldCheck, title: 'Money Back', body: '30-day returns, no questions asked.' },
  { icon: CreditCard, title: 'Secure Payments', body: 'Encrypted checkout you can trust.' },
]

/**
 * Service features strip — gold icon chips on midnight cards.
 * variant:
 *   "home"  → 3 columns, the first three features (no surface band)
 *   "band"  → 4 columns on a raised surface band (about page)
 */
export function ServiceFeatures({ variant = 'home', features }) {
  const items = features ?? (variant === 'band' ? defaultFeatures : defaultFeatures.slice(0, 3))
  const gridCols = items.length >= 4 ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-3'
  const card = variant === 'band'
    ? 'bg-[var(--color-surface-2)]'
    : 'bg-[var(--color-surface)]'
  const chip = variant === 'band'
    ? 'bg-[var(--color-surface)]'
    : 'bg-[var(--color-surface-2)]'

  const inner = (
    <Container className={variant === 'band' ? 'py-12 sm:py-16' : undefined}>
      <div className={`grid grid-cols-1 gap-4 ${gridCols}`}>
        {items.map((f) => (
          <div key={f.title} className={`flex items-center gap-4 rounded-lg border border-[var(--color-border)] ${card} p-5`}>
            <span className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${chip} text-[var(--color-primary)]`}>
              <f.icon className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-display text-sm font-bold text-[var(--color-text)]">{f.title}</h3>
              <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">{f.body}</p>
            </div>
          </div>
        ))}
      </div>
    </Container>
  )

  // "band" renders on a raised surface <section>; default wraps in <Section>.
  if (variant === 'band') {
    return <section className="bg-[var(--color-surface)]">{inner}</section>
  }
  return <Section className="py-12 sm:py-16">{inner}</Section>
}
