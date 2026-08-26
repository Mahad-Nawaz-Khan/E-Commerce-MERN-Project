import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Lock, Check, ShieldCheck } from 'lucide-react'
import { Card, Button, Input } from '../../components/ui'
import { useChangePasswordMutation } from '../../features/user/userApiSlice'
import { useAuth } from '../../hooks'

const RULES = [
  { key: 'len', label: 'At least 6 characters', test: (p) => p.length >= 6 },
  { key: 'upper', label: 'An uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { key: 'lower', label: 'A lowercase letter', test: (p) => /[a-z]/.test(p) },
  { key: 'num', label: 'A number', test: (p) => /[0-9]/.test(p) },
  { key: 'sym', label: 'A symbol', test: (p) => /[^A-Za-z0-9]/.test(p) },
]

/** Change password — verifies current, enforces rules, force re-login on success. */
export function SecurityScreen() {
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const [changePassword, { isLoading }] = useChangePasswordMutation()
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' })

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })) }

  const passed = RULES.filter((r) => r.test(form.newPassword)).length
  const strength = form.newPassword === '' ? 0 : Math.round((passed / RULES.length) * 100)
  const strengthTone = strength <= 33 ? 'bg-[var(--color-sale)]' : strength <= 66 ? 'bg-[var(--color-warning)]' : 'bg-[var(--color-success)]'
  const strengthLabel = strength <= 33 ? 'Weak' : strength <= 66 ? 'Fair' : 'Strong'

  const mismatch = form.confirm.length > 0 && form.confirm !== form.newPassword

  async function submit(e) {
    e.preventDefault()
    if (mismatch) { toast.error('Passwords do not match'); return }
    if (passed < 2) { toast.error('Choose a stronger password'); return }
    try {
      await changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword }).unwrap()
      toast.success('Password changed. Please sign in again.')
      // Backend invalidates all sessions on password change.
      await signOut()
      navigate('/login')
    } catch (err) {
      toast.error(err?.data?.error?.message || 'Could not change password')
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-black text-[var(--color-text)]">Security</h1>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">Change your password regularly to keep your account safe.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Account Safety">
          <div className="space-y-3 text-sm text-[var(--color-text-muted)]">
            <p className="flex items-start gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-success)]" /> Passwords are hashed with bcrypt (12 rounds) and never stored in plain text.</p>
            <p className="flex items-start gap-2"><Lock className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-primary)]" /> Changing your password signs you out of all devices.</p>
          </div>
        </Card>

        <Card className="lg:col-span-2" title="Change Password">
          <form onSubmit={submit} className="space-y-4">
            <Input label="Current Password" type="password" autoComplete="current-password" required value={form.currentPassword} onChange={(e) => set('currentPassword', e.target.value)} placeholder="••••••••" />
            <Input label="New Password" type="password" autoComplete="new-password" required value={form.newPassword} onChange={(e) => set('newPassword', e.target.value)} placeholder="••••••••" />

            {/* Strength meter */}
            {form.newPassword && (
              <div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-surface-2)]">
                  <div className={`h-full rounded-full transition-all ${strengthTone}`} style={{ width: `${strength}%` }} />
                </div>
                <p className="mt-1 text-xs text-[var(--color-text-muted)]">Strength: <span className="font-medium text-[var(--color-text)]">{strengthLabel}</span></p>
              </div>
            )}

            {/* Requirements */}
            <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {RULES.map((r) => {
                const ok = r.test(form.newPassword)
                return (
                  <li key={r.key} className={`flex items-center gap-1.5 text-xs ${ok ? 'text-[var(--color-success)]' : 'text-[var(--color-text-subtle)]'}`}>
                    <Check className={`h-3.5 w-3.5 ${ok ? 'opacity-100' : 'opacity-30'}`} /> {r.label}
                  </li>
                )
              })}
            </ul>

            <Input label="Confirm New Password" type="password" autoComplete="new-password" required value={form.confirm} onChange={(e) => set('confirm', e.target.value)} placeholder="Re-enter new password" error={mismatch ? 'Passwords do not match' : undefined} />

            <div className="flex justify-end pt-2">
              <Button type="submit" loading={isLoading}><Check className="h-4 w-4" /> Update password</Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
