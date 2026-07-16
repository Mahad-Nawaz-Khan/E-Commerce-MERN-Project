import { cloneElement, isValidElement } from 'react'
import { Button as AntButton } from 'antd'

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
function Button({
  className = '',
  variant = 'default',
  size = 'default',
  asChild = false,
  children,
  ...props
}) {
  const classes = `inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 ${className}`
  const type = variant === 'outline' ? 'default' : variant === 'ghost' ? 'text' : variant === 'link' ? 'link' : 'primary'
  const sizeMap = { sm: 'small', lg: 'large', default: 'middle', icon: 'middle' }

  // asChild: merge button classes onto the single child element (Radix Slot pattern)
  if (asChild && isValidElement(children)) {
    const child = children
    return cloneElement(child, {
      className: `${classes} ${child.props.className ?? ''}`,
      ...props,
    })
  }

  return (
    <AntButton
      type={type}
      size={sizeMap[size]}
      shape={size === 'icon' ? 'circle' : 'default'}
      className={classes}
      {...props}
    >
      {children}
    </AntButton>
  )
}

export { Button }
