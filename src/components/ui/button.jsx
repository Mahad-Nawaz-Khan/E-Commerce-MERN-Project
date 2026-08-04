import { forwardRef } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'
import { cn } from '../../lib/cn'
import { Spinner } from './spinner'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-medium rounded-md transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)] disabled:opacity-50 disabled:pointer-events-none select-none',
  {
    variants: {
      variant: {
        primary: 'bg-[var(--color-primary)] text-[var(--color-on-primary)] hover:bg-[var(--color-primary-hover)] active:bg-[var(--color-gold-press)]',
        secondary: 'bg-[var(--color-surface-2)] text-[var(--color-text)] hover:bg-[var(--color-border-strong)]',
        outline: 'border border-[var(--color-border-strong)] text-[var(--color-text)] hover:bg-[var(--color-surface-2)]',
        ghost: 'text-[var(--color-text)] hover:bg-[var(--color-surface-2)]',
        link: 'text-[var(--color-primary)] underline-offset-4 hover:underline p-0 h-auto',
        sale: 'bg-[var(--color-sale)] text-white hover:bg-[var(--color-sale-hover)]',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-11 px-5 text-sm',
        lg: 'h-12 px-7 text-base',
        icon: 'h-10 w-10 p-0',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  }
)

export const Button = forwardRef(function Button(
  { className, variant, size, asChild = false, loading = false, disabled, children, ...props },
  ref
) {
  const Comp = asChild ? Slot : 'button'
  // Radix Slot requires exactly ONE React element child. When asChild is set,
  // the caller provides that element (e.g. <Link>); we must not inject a
  // <Spinner/> as a second child. (loading + asChild is an unusual combo — if
  // ever needed, wrap the child in a fragment-with-spinner via Slottable.)
  if (asChild) {
    return (
      <Slot
        ref={ref}
        className={cn(buttonVariants({ variant, size }), loading && 'opacity-70 pointer-events-none', className)}
        {...props}
      >
        {children}
      </Slot>
    )
  }
  return (
    <Comp
      ref={ref}
      className={cn(buttonVariants({ variant, size }), loading && 'opacity-70 pointer-events-none', className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner className="h-4 w-4" />}
      {children}
    </Comp>
  )
})
