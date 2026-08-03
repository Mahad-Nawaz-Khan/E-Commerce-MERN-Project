import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Container } from '../ui/container'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import toast from 'react-hot-toast'

const cols = [
  { title: 'Shop', links: [['Home', '/'], ['Shop', '/shop'], ['Wishlist', '/wishlist'], ['Cart', '/cart']] },
  { title: 'Company', links: [['About', '/about'], ['Contact', '/contact'], ['FAQ', '/faq']] },
  { title: 'Legal', links: [['Privacy Policy', '/privacy-policy'], ['Terms of Use', '/terms-of-use']] },
]

export function Footer() {
  const [email, setEmail] = useState('')
  function subscribe(e) {
    e.preventDefault()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { toast.error('Enter a valid email address.'); return }
    toast.success('Subscribed. Watch your inbox for drops.')
    setEmail('')
  }
  return (
    <footer className="mt-20 border-t border-[var(--color-border)] bg-[var(--color-surface)]">
      <Container className="py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <p className="font-display text-xl font-black tracking-tight text-[var(--color-text)]">EXCLUSIVE<span className="text-[var(--color-primary)]">.</span></p>
            <p className="mt-2 max-w-xs text-sm text-[var(--color-text-muted)]">Premium tech & lifestyle, curated and showcased. Get early access to drops.</p>
            <form onSubmit={subscribe} className="mt-4 flex gap-2 max-w-sm">
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email for drops" aria-label="Email address" className="h-10" />
              <Button type="submit" size="md" className="shrink-0">Subscribe</Button>
            </form>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <h3 className="font-display text-sm font-bold text-[var(--color-text)]">{c.title}</h3>
              <ul className="mt-3 space-y-2">
                {c.links.map(([label, to]) => (
                  <li key={to}><Link to={to} className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)]">{label}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[var(--color-border)] pt-6">
          <p className="text-xs text-[var(--color-text-subtle)]">© {new Date().getFullYear()} Exclusive. All rights reserved.</p>
          <div className="flex gap-2 text-xs text-[var(--color-text-subtle)]">
            <span className="rounded border border-[var(--color-border)] px-2 py-1">VISA</span>
            <span className="rounded border border-[var(--color-border)] px-2 py-1">MC</span>
            <span className="rounded border border-[var(--color-border)] px-2 py-1">bKash</span>
          </div>
        </div>
      </Container>
    </footer>
  )
}
