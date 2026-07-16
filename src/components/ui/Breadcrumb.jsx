import { Link } from 'react-router-dom'
import { Breadcrumb as AntBreadcrumb } from 'antd'
import { RightOutlined } from '@ant-design/icons'

/**
 * Breadcrumb — extracted from the repeated Home › Page markup on every
 * sub-page. Pass an array of crumbs; the last one is rendered as plain text
 * (the current page), the rest as links.
 *
 * crumbs: Array<{ label: string, to?: string }>  (omit `to` for the current page)
 */
function Breadcrumb({ crumbs = [], className = '' }) {
  return (
    <nav className={`py-3.5 text-sm ${className}`}>
      <AntBreadcrumb
        separator={<RightOutlined className="!text-xs !text-[#666666]" />}
        items={crumbs.map((crumb, index) => ({
          title:
            crumb.to && index < crumbs.length - 1 ? (
              <Link to={crumb.to} className="text-[#666666] hover:text-black transition-colors">
                {crumb.label}
              </Link>
            ) : (
              <span>{crumb.label}</span>
            ),
        }))}
      />
    </nav>
  )
}

export { Breadcrumb }
