import { useState } from 'react'
import toast from 'react-hot-toast'
import { Phone, Mail, Clock, Send } from 'lucide-react'
import { Container, Breadcrumb, Input, Textarea, Button } from '../components/ui'

const empty = { name: '', email: '', phone: '', message: '' }
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const details = [
  { icon: Phone, title: 'Call to us', lines: ['We are available 24/7, 7 days a week.', 'Phone: +8801611112222'] },
  { icon: Mail, title: 'Write to us', lines: ['Fill out our form and we will contact you within 24 hours.', 'customer@exclusive.com', 'support@exclusive.com'] },
  { icon: Clock, title: 'Office hours', lines: ['Sunday – Friday, 9am – 8pm', 'Closed on Saturdays and public holidays.'] },
]

/** Contact route — left contact details, right validated message form with success toast. */
function ContactScreen() {
  const [form, setForm] = useState(empty)
  const [errors, setErrors] = useState({})

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })) }

  function validate() {
    const e = {}
    if (form.name.trim().length < 2) e.name = 'Please enter your name'
    if (!emailRe.test(form.email)) e.email = 'Valid email required'
    if (form.phone && !/^[0-9+\-\s()]{6,}$/.test(form.phone)) e.phone = 'Enter a valid phone number'
    if (form.message.trim().length < 10) e.message = 'Message must be at least 10 characters'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function submit(e) {
    e.preventDefault()
    if (!validate()) { toast.error('Please fix the highlighted fields.'); return }
    toast.success('Message sent — we will reply within 24 hours.')
    setForm(empty)
  }

  return (
    <Container className="py-10">
      <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Contact' }]} className="mb-8" />

      <div className="overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="grid grid-cols-1 md:grid-cols-3">
          {details.map((d, i) => (
            <div
              key={d.title}
              className={
                'p-8 ' +
                (i < details.length - 1 ? 'md:border-r border-[var(--color-border)]' : '') +
                (i < details.length - 1 ? ' border-b md:border-b-0' : '')
              }
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-primary)]/15 text-[var(--color-primary)]">
                <d.icon className="h-5 w-5" />
              </span>
              <h2 className="mt-4 font-display text-base font-bold text-[var(--color-text)]">{d.title}</h2>
              <div className="mt-2 space-y-1 text-sm text-[var(--color-text-muted)]">
                {d.lines.map((line) => <p key={line}>{line}</p>)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6 sm:p-8">
        <h1 className="font-display text-2xl font-black tracking-tight text-[var(--color-text)]">Send us a message</h1>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">We typically reply within 24 hours.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <Input label="Your name" placeholder="Jane Doe" value={form.name} onChange={(e) => set('name', e.target.value)} error={errors.name} />
            <Input label="Email" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => set('email', e.target.value)} error={errors.email} />
            <Input label="Phone" type="tel" placeholder="Optional" value={form.phone} onChange={(e) => set('phone', e.target.value)} error={errors.phone} />
          </div>
          <Textarea label="Message" placeholder="How can we help?" rows={6} value={form.message} onChange={(e) => set('message', e.target.value)} error={errors.message} />
          <div className="flex justify-end">
            <Button type="submit"><Send className="h-4 w-4" /> Send message</Button>
          </div>
        </form>
      </div>
    </Container>
  )
}

export { ContactScreen }
