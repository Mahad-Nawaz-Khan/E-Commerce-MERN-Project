import { Breadcrumb } from '../components/ui/Breadcrumb'

function ContentPage({ title, intro, sections }) {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-292.5 px-4 py-10 sm:px-6 lg:px-0">
        <Breadcrumb crumbs={[{ label: 'Home', to: '/' }, { label: title }]} />
        <div className="mx-auto max-w-3xl py-12 sm:py-16">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#DB4444]">
            Quick Link
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
          <p className="mt-5 leading-7 text-gray-600">{intro}</p>

          <div className="mt-12 space-y-10">
            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="text-xl font-semibold">{section.title}</h2>
                <div className="mt-4 space-y-3 leading-7 text-gray-600">
                  {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                </div>
              </section>
            ))}
          </div>

          <p className="mt-12 border-t pt-6 text-sm text-gray-500">Last updated: July 18, 2026</p>
        </div>
      </div>
    </div>
  )
}

export { ContentPage }
