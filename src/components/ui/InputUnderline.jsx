import { forwardRef, useState } from 'react'

/**
 * Underline input with a floating label — used on the Login and Sign-up forms.
 * Label floats up when focused or when the field has a value.
 */
const baseClasses =
  'w-full border-0 border-b border-gray-200 bg-transparent pb-2 pt-4 text-base placeholder:text-transparent focus:border-gray-900 focus:outline-none focus:ring-0'

const InputUnderline = forwardRef(function InputUnderline(
  { className = '', type = 'text', label, ...props },
  ref,
) {
  const [isFocused, setIsFocused] = useState(false)
  const [hasValue, setHasValue] = useState(false)

  return (
    <div className="relative">
      <input
        type={type}
        ref={ref}
        placeholder={label}
        className={`${baseClasses} ${className}`}
        onFocus={() => setIsFocused(true)}
        onBlur={(e) => {
          setIsFocused(false)
          setHasValue(e.target.value !== '')
        }}
        onChange={(e) => setHasValue(e.target.value !== '')}
        {...props}
      />
      <span
        className={`pointer-events-none absolute left-0 top-4 text-gray-500 transition-all duration-200 ${
          isFocused || hasValue ? '-translate-y-3 text-sm text-gray-600' : ''
        }`}
      >
        {label}
      </span>
    </div>
  )
})

export { InputUnderline }
