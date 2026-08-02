import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** clsx (conditionals) + tailwind-merge (conflict resolution). Use everywhere. */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
