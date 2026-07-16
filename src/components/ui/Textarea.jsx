import { forwardRef } from 'react'
import { Input } from 'antd'

/** Standard shadcn-style textarea. Forwards ref. */
const Textarea = forwardRef(function Textarea({ className = '', ...props }, ref) {
  return (
    <Input.TextArea
      ref={ref}
      className={`flex! min-h-15! w-full! rounded-md! border! border-input! bg-transparent! px-3! py-2! text-base! shadow-sm! placeholder:text-muted-foreground! md:text-sm! ${className}`}
      {...props}
    />
  )
})

export { Textarea }
