import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle2, CircleX, MailCheck, X } from 'lucide-react'
import { Button, Container, Spinner } from '../components/ui'
import { useVerifyEmailQuery } from '../features/auth'

/** Public email-verification landing page. Verification never signs the visitor in. */
function VerifyEmailScreen() {
  const [params] = useSearchParams()
  const token = params.get('token')
  const { isLoading, isSuccess, error } = useVerifyEmailQuery(token, { skip: !token })
  const message = error?.data?.error?.message || 'This verification link is invalid or has expired.'

  function closeWindow() { window.close() }

  return (
    <Container className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
      <section className="w-full max-w-md rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center shadow-xl">
        {(!token || error) ? <CircleX className="mx-auto h-12 w-12 text-[var(--color-sale)]" /> : isLoading ? <Spinner className="mx-auto h-10 w-10" /> : <CheckCircle2 className="mx-auto h-12 w-12 text-[var(--color-primary)]" />}
        <h1 className="mt-5 font-display text-2xl font-black text-[var(--color-text)]">{isLoading ? 'Verifying your email' : isSuccess ? 'Email verified' : 'Verification unavailable'}</h1>
        <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-muted)]">{isLoading ? 'Please wait while we confirm your email address.' : isSuccess ? 'Your account is ready. You can close this window and return to sign in.' : message}</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild><Link to="/login"><MailCheck className="h-4 w-4" /> Go to sign in</Link></Button>
          {isSuccess && <Button variant="outline" onClick={closeWindow}><X className="h-4 w-4" /> Close this window</Button>}
        </div>
      </section>
    </Container>
  )
}

export { VerifyEmailScreen }