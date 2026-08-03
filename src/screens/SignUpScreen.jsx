import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import toast from 'react-hot-toast'
import { Sparkles, UserPlus } from 'lucide-react'
import { Button, Input } from '../components/ui'
import { loginSuccess } from '../features/auth'

const empty = { name: '', email: '', password: '', confirm: '' }
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Sign-up route — split layout: midnight promo panel left, validated create-account form right. */
function SignUpScreen() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [form, setForm] = useState(empty)
  const [errors, setErrors] = useState({})

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

  function submit(e) {
    e.preventDefault()
    if (!validate()) { toast.error('Please fix the highlighted fields.'); return }
    dispatch(loginSuccess({ email: form.email, name: form.name.trim() }))
    toast.success('Account created — welcome to Exclusive!')
    navigate('/')
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

          <form onSubmit={submit} className="mt-8 space-y-4">
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

            <Button type="submit" className="w-full">
              <UserPlus className="h-4 w-4" /> Create account
            </Button>
          </form>

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
