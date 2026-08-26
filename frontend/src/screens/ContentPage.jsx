import { Container, Breadcrumb } from '../components/ui'

/** Content route — warm surface-paper panel for readable legal text (privacy / terms). */
function ContentPage({ title, intro, sections }) {
  return (
    <Container className="py-10">
      <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: title }]} className="mb-8" />
      <article className="surface-paper mx-auto max-w-3xl rounded-lg p-8 sm:p-12">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-gold-press)]">Quick link</p>
        <h1 className="font-display text-3xl font-black tracking-tight sm:text-4xl">{title}</h1>
        {intro && <p className="mt-5 leading-7 text-[var(--color-midnight-500)]">{intro}</p>}

        <div className="mt-10 space-y-8">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="font-display text-lg font-bold">{section.title}</h2>
              <div className="mt-3 space-y-3 leading-7 text-[var(--color-midnight-500)]">
                {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </div>
            </section>
          ))}
        </div>

        <p className="mt-10 border-t border-[var(--color-line)] pt-6 text-xs text-[var(--color-content-mut)]">
          Last updated: July 18, 2026
        </p>
      </article>
    </Container>
  )
}

export { ContentPage }
