import { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Sparkles, UserPlus } from 'lucide-react'
import { Button, Input } from '../components/ui'
import { useRegisterMutation } from '../features/auth'

const empty = { name: '', email: '', password: '', confirm: '' }
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Sign-up route — split layout: midnight promo panel left, validated create-account form right. */
function SignUpScreen() {
  const [form, setForm] = useState(empty)
  const [errors, setErrors] = useState({})
  const [submittedEmail, setSubmittedEmail] = useState('')
  const [register, { isLoading }] = useRegisterMutation()

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })) }

  function validate() {
    const e = {}
    if (form.name.trim().length < 2) e.name = 'Please enter your name'
    if (!emailRe.test(form.email)) e.email = 'Enter a valid email address'
    if (form.password.length < 6) e.password = 'At least 6 characters'
    if (form.confirm !== form.password) e.confirm = 'Passwords do not match'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function submit(e) {
    e.preventDefault()
    if (!validate()) { toast.error('Please fix the highlighted fields.'); return }
    try {
      const res = await register({
        name: form.name.trim(),
        email: form.email,
        password: form.password,
      }).unwrap()
      setSubmittedEmail(form.email)
      toast.success(res.data?.message || 'Account created — check your email to verify it.')
    } catch (err) {
      const msg = err?.data?.error?.message || err?.data?.message || 'Could not create account'
      toast.error(msg)
    }
  }

  return (
    <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-2">
      {/* Left — promo panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden border-r border-[var(--color-border)] bg-[var(--color-surface)] p-12 lg:flex">
        <div className="pointer-events-none absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-[var(--color-primary)]/10 blur-3xl" />
        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border-strong)] px-3 py-1 text-xs font-medium text-[var(--color-primary)]">
            <Sparkles className="h-3.5 w-3.5" /> Join Exclusive
          </span>
        </div>
        <div className="relative max-w-md">
          <h2 className="font-display text-4xl font-black leading-tight tracking-tight text-[var(--color-text)]">
            Create your pass to the <span className="text-[var(--color-primary)]">showroom.</span>
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-[var(--color-text-muted)]">
            Faster checkout, saved wishlists, order tracking, and first access to flash sales and new drops.
          </p>
        </div>
        <p className="relative text-xs text-[var(--color-text-subtle)]">Members get free delivery over the ship threshold.</p>
      </div>

      {/* Right — form */}
      <div className="flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-sm">
          <h1 className="font-display text-3xl font-black tracking-tight text-[var(--color-text)]">Create an account</h1>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">Enter your details below</p>

          {submittedEmail ? (
            <div className="mt-8 rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface-2)] p-5">
              <h2 className="font-display text-lg font-bold text-[var(--color-text)]">Check your inbox</h2>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-muted)]">A verification link was sent to <span className="font-medium text-[var(--color-text)]">{submittedEmail}</span>. Verify your email before signing in.</p>
              <Button asChild className="mt-5 w-full"><Link to="/login">Go to sign in</Link></Button>
            </div>
          ) : <form onSubmit={submit} className="mt-8 space-y-4">
            <Input
              label="Name"
              autoComplete="name"
              placeholder="Your name"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              error={errors.name}
            />
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              error={errors.email}
            />
            <Input
              label="Password"
              type="password"
              autoComplete="new-password"
              placeholder="At least 6 characters"
              value={form.password}
              onChange={(e) => set('password', e.target.value)}
              error={errors.password}
            />
            <Input
              label="Confirm password"
              type="password"
              autoComplete="new-password"
              placeholder="Re-enter your password"
              value={form.confirm}
              onChange={(e) => set('confirm', e.target.value)}
              error={errors.confirm}
            />

            <Button type="submit" className="w-full" loading={isLoading}>
              <UserPlus className="h-4 w-4" /> Create account
            </Button>
          </form>}

          <p className="mt-6 text-center text-sm text-[var(--color-text-muted)]">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-[var(--color-primary)] hover:underline">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export { SignUpScreen }
