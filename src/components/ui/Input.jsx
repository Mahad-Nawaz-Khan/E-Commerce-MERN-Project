import { forwardRef } from 'react'

/** Standard shadcn-style text input. Forwards ref for form libraries. */
const Input = forwardRef(function Input({ className = '', type = 'text', ...props }, ref) {
  return (
    <input
      type={type}
      ref={ref}
      className={`${baseClasses} ${className}`}
      {...props}
    />
  )
})

const baseClasses =
  'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm'

export { Input }
