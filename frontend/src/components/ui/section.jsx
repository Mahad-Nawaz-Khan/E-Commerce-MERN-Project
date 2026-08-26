import { cn } from '../../lib/cn'
export function Section({ className, children, id }) {
  return <section id={id} className={cn('py-12 sm:py-16 lg:py-20', className)}>{children}</section>
}
