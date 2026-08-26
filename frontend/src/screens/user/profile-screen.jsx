import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import toast from 'react-hot-toast'
import { Check, BadgeCheck } from 'lucide-react'
import { Card, Button, Input } from '../../components/ui'
import { useUpdateUserMutation } from '../../features/user/userApiSlice'
import { setCredentials } from '../../features/auth/authSlice'

/** Edit profile — name, phone (email read-only). Persists + refreshes auth slice. */
export function ProfileScreen() {
  const { user, token } = useSelector((state) => state.auth)

  if (!user) return null
  return <ProfileForm key={user.id} user={user} token={token} />
}

/** Split out so useState initializes from the loaded user (no sync effect needed). */
function ProfileForm({ user, token }) {
  const dispatch = useDispatch()
  const [updateUser, { isLoading }] = useUpdateUserMutation()
  const [form, setForm] = useState({ name: user.name || '', phone: user.phone || '' })

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })) }

  async function submit(e) {
    e.preventDefault()
    try {
      const res = await updateUser({ id: user.id, name: form.name.trim(), phone: form.phone.trim() }).unwrap()
      // Keep the auth slice in sync with the updated user object.
      dispatch(setCredentials({ user: res.data, token }))
      toast.success('Profile updated')
    } catch (err) {
      toast.error(err?.data?.error?.message || 'Could not update profile')
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-black text-[var(--color-text)]">My Profile</h1>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">Update your personal information.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Avatar / summary */}
        <Card>
          <div className="flex flex-col items-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-primary)] text-2xl font-black text-[var(--color-on-primary)]">
              {user?.name?.charAt(0).toUpperCase() ?? 'U'}
            </div>
            <p className="mt-3 font-display text-base font-bold text-[var(--color-text)]">{user?.name}</p>
            <p className="text-xs text-[var(--color-text-muted)]">{user?.email}</p>
            {user?.isEmailVerified && (
              <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[var(--color-success)]"><BadgeCheck className="h-3.5 w-3.5" /> Verified</span>
            )}
          </div>
        </Card>

        {/* Edit form */}
        <Card className="lg:col-span-2" title="Personal Information">
          <form onSubmit={submit} className="space-y-4">
            <Input label="Full Name" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Your name" />
            <Input label="Email" value={user?.email || ''} readOnly disabled className="opacity-70" />
            <Input label="Phone" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+1 555 0100" />
            <div className="flex justify-end pt-2">
              <Button type="submit" loading={isLoading}><Check className="h-4 w-4" /> Save changes</Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
