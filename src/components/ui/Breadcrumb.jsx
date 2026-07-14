import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

/**
 * Breadcrumb — extracted from the repeated Home › Page markup on every
 * sub-page. Pass an array of crumbs; the last one is rendered as plain text
 * (the current page), the rest as links.
 *
 * crumbs: Array<{ label: string, to?: string }>  (omit `to` for the current page)
 */
function Breadcrumb({ crumbs = [], className = '' }) {
  return (
    <nav className={`flex items-center gap-2 py-3.5 text-sm ${className}`}>
      {crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1
        return (
          <span key={crumb.label} className="flex items-center gap-2">
            {crumb.to && !isLast ? (
              <Link
                to={crumb.to}
                className="text-[#666666] hover:text-black transition-colors"
              >
                {crumb.label}
              </Link>
            ) : (
              <span>{crumb.label}</span>
            )}
            {!isLast && <ChevronRight className="w-4 h-4 text-[#666666]" />}
          </span>
        )
      })}
    </nav>
  )
}

export { Breadcrumb }
