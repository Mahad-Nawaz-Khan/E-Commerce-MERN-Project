import { cloneElement, isValidElement } from 'react'

/**
 * Button — plain JSX/Tailwind (no Radix, no cva).
 * Supports the same variants/sizes the ported components use.
 *
 * Props:
 *   variant: 'default' | 'outline' | 'ghost' | 'link'
 *   size:    'default' | 'sm' | 'lg' | 'icon'
 *   asChild: merge button classes onto the single child element (e.g. a <Link/>),
 *            mirroring Radix Slot behavior — used for <Button asChild><Link/></Button>
 *   ...rest  forwarded to the underlying element
 */
const base =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0'

const variants = {
  default: 'bg-primary text-primary-foreground shadow hover:bg-primary/90',
  outline:
    'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
  ghost: 'hover:bg-accent hover:text-accent-foreground',
  link: 'text-primary underline-offset-4 hover:underline',
}

const sizes = {
  default: 'h-9 px-4 py-2',
  sm: 'h-8 rounded-md px-3 text-xs',
  lg: 'h-10 rounded-md px-8',
  icon: 'h-9 w-9',
}

function Button({
  className = '',
  variant = 'default',
  size = 'default',
  asChild = false,
  children,
  ...props
}) {
  const classes = `${base} ${variants[variant]} ${sizes[size]} ${className}`

  // asChild: merge button classes onto the single child element (Radix Slot pattern)
  if (asChild && isValidElement(children)) {
    const child = children
    return cloneElement(child, {
      className: `${classes} ${child.props.className ?? ''}`,
      ...props,
    })
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  )
}

export { Button }
