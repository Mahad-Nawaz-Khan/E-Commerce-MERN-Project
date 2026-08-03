import { Truck, Headphones, ShieldCheck, CreditCard } from 'lucide-react'
import { Container } from '../ui'

const features = [
  { icon: Truck, title: 'Free Delivery', body: 'On orders over the free-ship threshold.' },
  { icon: Headphones, title: '24/7 Service', body: 'Real humans, ready when you need them.' },
  { icon: ShieldCheck, title: 'Money Back', body: '30-day returns, no questions asked.' },
  { icon: CreditCard, title: 'Secure Payments', body: 'Encrypted checkout you can trust.' },
]

/** Service features strip — four midnight cards with gold icon chips. */
export function ServiceFeatures() {
  return (
    <section className="bg-[var(--color-surface)]">
      <Container className="py-12 sm:py-16">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.title} className="flex items-center gap-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] p-5">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface)] text-[var(--color-primary)]">
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
    </section>
  )
}
