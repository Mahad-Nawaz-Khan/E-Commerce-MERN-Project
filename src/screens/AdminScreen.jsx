import { useState } from 'react'
import { FileText, HelpCircle, PackagePlus, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Textarea } from '../components/ui/Textarea'
import { faqs, policySections, termsSections } from '../data/siteContent'

const adminSections = [
  { id: 'privacy', label: 'Privacy Policy', icon: FileText },
  { id: 'terms', label: 'Terms of Use', icon: FileText },
  { id: 'faq', label: 'FAQ', icon: HelpCircle },
  { id: 'product', label: 'Add Product', icon: PackagePlus },
]

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium">{label}</span>
      {children}
    </label>
  )
}

function AdminScreen() {
  const [active, setActive] = useState('privacy')
  const pageSections = active === 'privacy' ? policySections : termsSections
  const pageTitle = active === 'privacy' ? 'Privacy Policy' : 'Terms of Use'

  const saveDemo = (event) => {
    event.preventDefault()
    toast.success('Demo data saved in this session')
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] py-10">
      <div className="mx-auto grid max-w-292.5 gap-6 px-4 sm:px-6 lg:grid-cols-[240px_1fr] lg:px-0">
        <aside className="h-fit bg-black p-5 text-white">
          <p className="text-xl font-semibold">Admin</p>
          <p className="mt-1 text-xs text-gray-400">Content & products</p>
          <nav className="mt-7 space-y-1">
            {adminSections.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActive(id)}
                className={`flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition ${
                  active === id ? 'bg-[#DB4444] text-white' : 'text-gray-300 hover:bg-white/10'
                }`}
              >
                <Icon className="size-4" />
                {label}
              </button>
            ))}
          </nav>
        </aside>

        <section className="bg-white p-5 shadow-sm sm:p-8">
          {active === 'product' ? (
            <form onSubmit={saveDemo}>
              <h1 className="text-2xl font-semibold">Add Product</h1>
              <p className="mt-2 text-sm text-gray-500">Demo form matching the fields used by the current product data.</p>
              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                <Field label="Product name"><Input required placeholder="Wireless Controller" /></Field>
                <Field label="Slug"><Input required placeholder="wireless-controller" /></Field>
                <Field label="Price"><Input required type="number" min="0" placeholder="120" /></Field>
                <Field label="Original price"><Input type="number" min="0" placeholder="160" /></Field>
                <Field label="Category"><Input required placeholder="Gaming" /></Field>
                <Field label="Stock"><Input required type="number" min="0" placeholder="25" /></Field>
                <Field label="Image path"><Input placeholder="/images/products/gamepad.png" /></Field>
                <Field label="Tags"><Input placeholder="featured, new" /></Field>
                <div className="sm:col-span-2">
                  <Field label="Description"><Textarea required rows={5} placeholder="Product description" /></Field>
                </div>
              </div>
              <Button htmlType="submit" className="mt-7 h-11! rounded-sm! bg-[#DB4444]! px-6!">
                <PackagePlus /> Add demo product
              </Button>
            </form>
          ) : active === 'faq' ? (
            <form onSubmit={saveDemo}>
              <h1 className="text-2xl font-semibold">FAQ Content</h1>
              <p className="mt-2 text-sm text-gray-500">The same questions displayed on the public FAQ page.</p>
              <div className="mt-8 space-y-5">
                {faqs.map((faq, index) => (
                  <div key={faq.question} className="grid gap-3 border p-4">
                    <Field label={`Question ${index + 1}`}><Input defaultValue={faq.question} /></Field>
                    <Field label="Answer"><Textarea rows={3} defaultValue={faq.answer} /></Field>
                  </div>
                ))}
              </div>
              <Button htmlType="submit" className="mt-7 h-11! rounded-sm! bg-[#DB4444]! px-6!"><Save /> Save demo content</Button>
            </form>
          ) : (
            <form onSubmit={saveDemo}>
              <h1 className="text-2xl font-semibold">{pageTitle} Content</h1>
              <p className="mt-2 text-sm text-gray-500">The same sections displayed on the public {pageTitle} page.</p>
              <div className="mt-8 space-y-5">
                {pageSections.map((section, index) => (
                  <div key={section.title} className="grid gap-3 border p-4">
                    <Field label={`Section ${index + 1} title`}><Input defaultValue={section.title} /></Field>
                    <Field label="Content"><Textarea rows={5} defaultValue={section.paragraphs.join('\n\n')} /></Field>
                  </div>
                ))}
              </div>
              <Button htmlType="submit" className="mt-7 h-11! rounded-sm! bg-[#DB4444]! px-6!"><Save /> Save demo content</Button>
            </form>
          )}
        </section>
      </div>
    </div>
  )
}

export { AdminScreen }
