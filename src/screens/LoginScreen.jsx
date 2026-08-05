import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import toast from 'react-hot-toast'
import { Sparkles } from 'lucide-react'
import { Button, Input } from '../components/ui'
import { setCredentials, useLoginMutation } from '../features/auth'

const empty = { email: '', password: '' }
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Login route — split layout: midnight promo panel left, validated form right. */
function LoginScreen() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [form, setForm] = useState(empty)
  const [errors, setErrors] = useState({})
  const [login, { isLoading }] = useLoginMutation()

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })) }

  function validate() {
    const e = {}
    if (!emailRe.test(form.email)) e.email = 'Enter a valid email address'
    if (form.password.length < 6) e.password = 'Password must be at least 6 characters'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function submit(e) {
    e.preventDefault()
    if (!validate()) { toast.error('Please fix the highlighted fields.'); return }
    try {
      const res = await login({ email: form.email, password: form.password }).unwrap()
      // Backend envelope: { success, data: { user, accessToken } }
      const { user, accessToken } = res.data
      dispatch(setCredentials({ user, token: accessToken }))
      toast.success(`Welcome back, ${user.name?.split(' ')[0] || 'friend'}!`)
      navigate(params.get('redirect') || '/')
    } catch (err) {
      const msg = err?.data?.error?.message || err?.data?.message || 'Invalid email or password'
      toast.error(msg)
    }
  }

  return (
    <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-2">
      {/* Left — promo panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden border-r border-[var(--color-border)] bg-[var(--color-surface)] p-12 lg:flex">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[var(--color-primary)]/10 blur-3xl" />
        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border-strong)] px-3 py-1 text-xs font-medium text-[var(--color-primary)]">
            <Sparkles className="h-3.5 w-3.5" /> The Midnight Showroom
          </span>
        </div>
        <div className="relative max-w-md">
          <h2 className="font-display text-4xl font-black leading-tight tracking-tight text-[var(--color-text)]">
            Premium tech, <span className="text-[var(--color-primary)]">curated after dark.</span>
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-[var(--color-text-muted)]">
            Sign in to track orders, save your wishlist, and unlock member-only drops from the brands you actually want.
          </p>
        </div>
        <p className="relative text-xs text-[var(--color-text-subtle)]">Trusted by 3 million shoppers across the region.</p>
      </div>

      {/* Right — form */}
      <div className="flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-sm">
          <h1 className="font-display text-3xl font-black tracking-tight text-[var(--color-text)]">Log in to Exclusive</h1>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">Enter your details below</p>

          <form onSubmit={submit} className="mt-8 space-y-4">
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
              autoComplete="current-password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => set('password', e.target.value)}
              error={errors.password}
            />

            <Button type="submit" className="w-full" loading={isLoading}>Log in</Button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--color-text-muted)]">
            Don&apos;t have an account?{' '}
            <Link to="/sign-up" className="font-medium text-[var(--color-primary)] hover:underline">Sign up</Link>
          </p>

          <div className="mt-8 rounded-md border border-dashed border-[var(--color-border)] px-3 py-2 text-xs text-[var(--color-text-subtle)]">
            Demo accounts (after seeding):
            <div className="mt-1 nums leading-relaxed">
              <div>Admin — <span className="text-[var(--color-text-muted)]">admin@exclusive.test / Admin123!</span></div>
              <div>Customer — <span className="text-[var(--color-text-muted)]">customer@exclusive.test / Customer123!</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export { LoginScreen }
