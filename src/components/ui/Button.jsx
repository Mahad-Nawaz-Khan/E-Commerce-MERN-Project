import { Button as AntButton } from 'antd'

/**
 * Button — plain JSX/Tailwind (no Radix, no cva).
 * Supports reusable button variants and sizes.
 *
 * Props: variant, size, and standard button attributes.
 */
function Button({
  className = '',
  variant = 'default',
  size = 'default',
  children,
  ...props
}) {
  const classes = `inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 ${className}`
  const type = variant === 'outline' ? 'default' : variant === 'ghost' ? 'text' : variant === 'link' ? 'link' : 'primary'
  const sizeMap = { sm: 'small', lg: 'large', default: 'middle', icon: 'middle' }

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
