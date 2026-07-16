import { createContext, useContext, useState } from 'react'
import { Radio } from 'antd'

/**
 * RadioGroup — plain JSX/Tailwind (replaces Radix-backed shadcn RadioGroup).
 * A small context pairs the group value with each item's value, mirroring
 * Radix's radio-group API used in the checkout payment selector.
 */
const RadioGroupContext = createContext({ value: undefined, setValue: () => {} })

function RadioGroup({ defaultValue, value: valueProp, onValueChange, className = '', children, ...props }) {
  const [internalValue, setInternalValue] = useState(defaultValue)
  const value = valueProp ?? internalValue

  const setValue = (next) => {
    if (valueProp === undefined) setInternalValue(next)
    onValueChange?.(next)
  }

  return (
    <RadioGroupContext.Provider value={{ value, setValue }}>
      <div role="radiogroup" className={`grid gap-2 ${className}`} {...props}>
        {children}
      </div>
    </RadioGroupContext.Provider>
  )
}

function RadioGroupItem({ value, id, className = '', ...props }) {
  const { value: groupValue, setValue } = useContext(RadioGroupContext)
  const checked = groupValue === value

  return (
    <Radio
      id={id}
      checked={checked}
      onChange={() => setValue(value)}
      className={`!m-0 !inline-flex !h-4 !w-4 !items-center !justify-center ${className}`}
      {...props}
    />
  )
}

export { RadioGroup, RadioGroupItem }
