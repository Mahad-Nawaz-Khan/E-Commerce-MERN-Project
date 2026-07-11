import { createContext, useContext, useState } from 'react'
import { Circle } from 'lucide-react'

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
    <button
      type="button"
      role="radio"
      id={id}
      aria-checked={checked}
      data-state={checked ? 'checked' : 'unchecked'}
      onClick={() => setValue(value)}
      className={`aspect-square h-4 w-4 rounded-full border border-primary text-primary shadow focus:outline-none focus-visible:ring-1 focus-visible:ring-ring ${className}`}
      {...props}
    >
      {checked && <Circle className="h-3.5 w-3.5 fill-primary" />}
    </button>
  )
}

export { RadioGroup, RadioGroupItem }
