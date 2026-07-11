/** Form label. */
function Label({ className = '', ...props }) {
  return (
    <label
      className={`${baseClasses} ${className}`}
      {...props}
    />
  )
}

const baseClasses =
  'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'

export { Label }
