import { forwardRef } from 'react'
import { Input as AntInput } from 'antd'

/** Standard shadcn-style text input. Forwards ref for form libraries. */
const Input = forwardRef(function Input({ className = '', type = 'text', ...props }, ref) {
  return (
    <AntInput
      type={type}
      ref={ref}
      className={`!flex !h-9 !w-full !rounded-md !border !border-input !bg-transparent !px-3 !py-1 !text-base !shadow-sm placeholder:!text-muted-foreground md:!text-sm ${className}`}
      {...props}
    />
  )
})

export { Input }
