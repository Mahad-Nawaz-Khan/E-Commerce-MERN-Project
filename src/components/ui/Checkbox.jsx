import { useState } from 'react'
import { Checkbox as AntCheckbox } from 'antd'

/**
 * Checkbox — plain JSX/Tailwind (replaces the Radix-backed shadcn Checkbox).
 * Controlled internally but exposes `onCheckedChange` for parity; also forwards
 * standard `checked`/`onChange`/`id` props for the billing form.
 */
function Checkbox({
  id,
  checked: checkedProp,
  onCheckedChange,
  className = '',
  ...props
}) {
  const [internalChecked, setInternalChecked] = useState(false)
  const checked = checkedProp ?? internalChecked

  const handleChange = (event) => {
    const next = event.target.checked
    setInternalChecked(next)
    onCheckedChange?.(next)
  }

  return (
    <AntCheckbox
      id={id}
      checked={checked}
      onChange={handleChange}
      className={`!inline-flex !h-4 !w-4 !shrink-0 !items-center !justify-center ${className}`}
      {...props}
    />
  )
}

export { Checkbox }
