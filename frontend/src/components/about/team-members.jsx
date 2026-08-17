import { Globe, AtSign, MessageCircle } from 'lucide-react'
import { Container, Avatar } from '../ui'

const teamMembers = [
  { initials: 'TC', name: 'Tom Cruise', role: 'Founder & Chairman' },
  { initials: 'EW', name: 'Emma Watson', role: 'Managing Director' },
  { initials: 'WS', name: 'Will Smith', role: 'Product Designer' },
]

const socials = [
  { Icon: Globe, label: 'Website' },
  { Icon: AtSign, label: 'Social handle' },
  { Icon: MessageCircle, label: 'Direct message' },
]

/** Team grid — three members with avatar fallbacks + social links on midnight cards. */
export function TeamMembers() {
  return (
    <Container className="py-12 sm:py-16">
      <div className="mb-8 text-center">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-primary)]">The people</p>
        <h2 className="font-display text-2xl font-black tracking-tight text-[var(--color-text)] sm:text-3xl">Meet the team</h2>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {teamMembers.map((member) => (
          <div key={member.name} className="flex flex-col items-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center">
            <Avatar fallback={member.initials} className="h-20 w-20 text-2xl" />
            <h3 className="mt-5 font-display text-lg font-bold text-[var(--color-text)]">{member.name}</h3>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">{member.role}</p>
            <div className="mt-5 flex items-center gap-3">
              {socials.map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={`${member.name} on ${label}`}
                  className="text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-primary)]"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Container>
  )
}
