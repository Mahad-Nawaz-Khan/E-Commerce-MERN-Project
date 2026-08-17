import { cn } from '../../lib/cn'
export function Container({ className, children }) {
  return <div className={cn('mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-10', className)}>{children}</div>
}
