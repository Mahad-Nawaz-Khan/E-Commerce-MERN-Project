import { Link } from 'react-router-dom'
import { Section, Container } from '../ui'
import { categories } from '../../data/categories'
import * as Icon from 'lucide-react'
import { cn } from '../../lib/cn'

/** Browse categories — cards linking to /shop?category= with a lucide icon per category. */
export function BrowseCategories() {
  return (
    <Section className="py-12 sm:py-16">
      <Container>
        <div className="mb-6 flex items-center gap-3">
          <span className="h-6 w-1.5 rounded-sm bg-[var(--color-primary)]" />
          <h2 className="font-display text-2xl font-bold text-[var(--color-text)] sm:text-3xl">Browse by category</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((c) => {
            const I = Icon[c.icon] || Icon.Tag
            return (
              <Link key={c.slug} to={`/shop?category=${encodeURIComponent(c.name)}`}
                className={cn('group flex flex-col items-center justify-center gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-8 text-center transition-all duration-300 hover:border-[var(--color-primary)] hover:shadow-[var(--shadow-card)]')}>
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-surface-2)] text-[var(--color-primary)] transition-colors group-hover:bg-[var(--color-primary)] group-hover:text-[var(--color-on-primary)]">
                  <I className="h-6 w-6" />
                </span>
                <span className="text-sm font-medium text-[var(--color-text)] group-hover:text-[var(--color-primary)]">{c.name}</span>
              </Link>
            )
          })}
        </div>
      </Container>
    </Section>
  )
}
