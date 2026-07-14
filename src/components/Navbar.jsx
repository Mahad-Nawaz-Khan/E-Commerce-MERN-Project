import { Link, NavLink } from 'react-router-dom'

const navLinks = [
  { path: '/contact', label: 'Contact' },
  { path: '/privacy-policy', label: 'Privacy Policy' },
  { path: '/terms-of-use', label: 'Terms' },
  { path: '/faq', label: 'FAQ' },
]

function Navbar() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between">
        <Link to="/" className="text-xl font-bold tracking-wide text-gray-950">
          Exclusive
        </Link>

        <nav className="flex flex-wrap gap-5 text-sm">
          {navLinks.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                isActive
                  ? 'font-semibold text-red-500'
                  : 'text-gray-700 hover:text-red-500'
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <input
            type="search"
            placeholder="What are you looking for?"
            className="w-full rounded bg-gray-100 px-3 py-2 text-sm outline-none md:w-56"
          />
        </div>
      </div>
    </header>
  )
}

export default Navbar
