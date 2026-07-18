import { ChevronDown } from 'lucide-react'
import { Breadcrumb } from '../components/ui/Breadcrumb'
import { faqs } from '../data/siteContent'

function FaqScreen() {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-292.5 px-4 py-10 sm:px-6 lg:px-0">
        <Breadcrumb crumbs={[{ label: 'Home', to: '/' }, { label: 'FAQ' }]} />
        <div className="mx-auto max-w-3xl py-12 sm:py-16">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#DB4444]">Help Center</p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Frequently Asked Questions</h1>
          <p className="mt-5 leading-7 text-gray-600">Quick answers to common questions about orders, delivery, payments, and returns.</p>

          <div className="mt-10 divide-y border-y">
            {faqs.map((faq) => (
              <details key={faq.question} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
                  {faq.question}
                  <ChevronDown className="size-5 shrink-0 transition-transform group-open:rotate-180" />
                </summary>
                <p className="max-w-2xl pt-4 leading-7 text-gray-600">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export { FaqScreen }
