import { Container, Breadcrumb, Accordion } from '../components/ui'
import { faqs } from '../data/siteContent'

/** FAQ route — Accordion primitive backed by the faqs data. */
function FaqScreen() {
  return (
    <Container className="py-10">
      <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'FAQ' }]} className="mb-8" />
      <div className="mx-auto max-w-3xl">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-primary)]">Help center</p>
        <h1 className="font-display text-3xl font-black tracking-tight text-[var(--color-text)] sm:text-4xl">
          Frequently asked questions
        </h1>
        <p className="mt-5 leading-7 text-[var(--color-text-muted)]">
          Quick answers to common questions about orders, delivery, payments, and returns.
        </p>

        <div className="mt-10">
          <Accordion items={faqs} />
        </div>
      </div>
    </Container>
  )
}

export { FaqScreen }
