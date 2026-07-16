import { forwardRef, useState } from 'react'
import { Input } from 'antd'

/**
 * Underline input with a floating label — used on the Login and Sign-up forms.
 * Label floats up when focused or when the field has a value.
 */
const baseClasses =
  'h-10! w-full! rounded-none! border-0! border-b! border-[#999]! bg-transparent! px-0! pb-1! pt-4! text-xs! text-black! shadow-none! placeholder:text-transparent! focus:border-black! focus:shadow-none!'

const InputUnderline = forwardRef(function InputUnderline(
  { className = '', type = 'text', label, ...props },
  ref,
) {
  const [isFocused, setIsFocused] = useState(false)
  const [hasValue, setHasValue] = useState(false)

  return (
    <div className="relative">
      <Input
        type={type}
        ref={ref}
        placeholder={label}
        className={`${baseClasses} ${className}`}
        {...props}
        onFocus={(event) => {
          setIsFocused(true)
          props.onFocus?.(event)
        }}
        onBlur={(e) => {
          setIsFocused(false)
          setHasValue(e.target.value !== '')
          props.onBlur?.(e)
        }}
        onChange={(e) => {
          setHasValue(e.target.value !== '')
          props.onChange?.(e)
        }}
      />
      <span
        className={`pointer-events-none absolute left-0 top-3 text-xs text-[#777] transition-all duration-200 ${
          isFocused || hasValue ? '-translate-y-3 text-2.5 text-black' : ''
        }`}
      >
        {label}
      </span>
    </div>
  )
})

export { InputUnderline }
