import { Container, Breadcrumb } from '../ui'

/** Our Story — origin narrative on a midnight surface with a gold-accent hero card. */
export function OurStory() {
  return (
    <section className="bg-[var(--color-surface)]">
      <Container className="py-10">
        <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'About' }]} className="mb-10" />
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-primary)]">Our Story</p>
            <h1 className="font-display text-3xl font-black tracking-tight text-[var(--color-text)] sm:text-4xl">
              Built for the people who queue for midnight drops.
            </h1>
            <div className="mt-5 space-y-4 text-sm leading-relaxed text-[var(--color-text-muted)]">
              <p>
                Launched in 2015, Exclusive is South Asia&apos;s premier online shopping marketplace with an active presence in
                Bangladesh. Backed by tailored marketing, data, and service solutions, Exclusive brings together 10,500 sellers
                and 300 brands to serve 3 million customers across the region.
              </p>
              <p>
                Our catalogue now spans more than a million products and grows every day — from consumer electronics to everyday
                essentials — curated for the people who care about what they buy.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {['Electronics', 'Audio', 'Gaming', 'Wearables', 'Accessories'].map((t) => (
                <span key={t} className="rounded-full border border-[var(--color-border-strong)] px-3 py-1 text-xs text-[var(--color-text-muted)]">{t}</span>
              ))}
            </div>
          </div>
          <div className="relative overflow-hidden rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface-2)] p-8">
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[var(--color-primary)]/10 blur-2xl" />
            <div className="relative grid grid-cols-2 gap-6">
              <div>
                <p className="font-display text-4xl font-black tracking-tight text-[var(--color-primary)] nums">2015</p>
                <p className="mt-1 text-xs text-[var(--color-text-muted)]">Founded</p>
              </div>
              <div>
                <p className="font-display text-4xl font-black tracking-tight text-[var(--color-text)] nums">3M+</p>
                <p className="mt-1 text-xs text-[var(--color-text-muted)]">Customers served</p>
              </div>
              <div>
                <p className="font-display text-4xl font-black tracking-tight text-[var(--color-text)] nums">300</p>
                <p className="mt-1 text-xs text-[var(--color-text-muted)]">Partner brands</p>
              </div>
              <div>
                <p className="font-display text-4xl font-black tracking-tight text-[var(--color-text)] nums">10.5k</p>
                <p className="mt-1 text-xs text-[var(--color-text-muted)]">Active sellers</p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
