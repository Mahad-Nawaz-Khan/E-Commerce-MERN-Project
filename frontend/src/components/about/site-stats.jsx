import { Calendar, DollarSign, ShoppingBag, Wallet } from 'lucide-react'
import { Container } from '../ui'

const stats = [
  { icon: Calendar, number: '10.5k', label: 'Sellers active on our site', highlight: false },
  { icon: DollarSign, number: '33k', label: 'Monthly product sale', highlight: true },
  { icon: ShoppingBag, number: '45.5k', label: 'Customers active on our site', highlight: false },
  { icon: Wallet, number: '25k', label: 'Annual gross sale', highlight: false },
]

/** Four stat cards — the highlighted monthly-sales card flips to the gold accent. */
export function SiteStats() {
  return (
    <Container className="py-12 sm:py-16">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className={
                'flex flex-col items-center justify-center rounded-lg border p-8 text-center transition-colors ' +
                (stat.highlight
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-on-primary)]'
                  : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:border-[var(--color-border-strong)]')
              }
            >
              <span
                className={
                  'mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full ' +
                  (stat.highlight ? 'bg-black/15' : 'bg-[var(--color-surface-2)] text-[var(--color-primary)]')
                }
              >
                <Icon className="h-8 w-8" />
              </span>
              <p className="font-display text-3xl font-black tracking-tight nums">{stat.number}</p>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">{stat.label}</p>
            </div>
          )
        })}
      </div>
    </Container>
  )
}
