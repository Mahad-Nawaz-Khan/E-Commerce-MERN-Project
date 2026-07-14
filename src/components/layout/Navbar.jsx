import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Heart, Search, ShoppingCart, Menu, X } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Contact', to: '/contact' },
  { label: 'About', to: '/about' },
  { label: 'Sign Up', to: '/sign-up' },
]

function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const pathname = location.pathname
  const [isOpen, setIsOpen] = useState(false)

  // Close the mobile menu when the route changes
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Close the mobile menu when clicking outside it
  useEffect(() => {
    const handleClick = (event) => {
      const target = event.target
      if (!target.closest('.mobile-menu') && !target.closest('.menu-trigger')) {
        setIsOpen(false)
      }
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  return (
    <div className="w-full bg-white relative z-50">
      {/* Top Banner */}
      <div className="w-full bg-black text-white py-3 px-4 flex justify-between items-center text-sm">
        <p className="text-center flex-1 font-medium">
          Summer Sale For All Swim Suits And Free Express Delivery - OFF 50%!
          <Link to="/" className="ml-2 underline">
            ShopNow
          </Link>
        </p>
        <select className="bg-black text-white border-none outline-none cursor-pointer font-medium">
          <option>English</option>
          <option>Spanish</option>
          <option>French</option>
        </select>
      </div>

      {/* Main Navigation */}
      <div className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden menu-trigger"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              <span className="sr-only">Toggle menu</span>
            </Button>

            {/* Logo */}
            <Link to="/" className="text-xl font-bold tracking-tight">
              Exclusive
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`text-sm font-medium transition-colors hover:text-gray-600 ${
                    pathname === link.to ? 'text-black font-semibold' : ''
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Search and Icons */}
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center max-w-xs w-full relative">
                <Input
                  type="search"
                  placeholder="What are you looking for?"
                  className="w-full pr-8 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                />
                <Search className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              <Button
                onClick={() => navigate('/wishlist')}
                variant="ghost"
                size="icon"
                className="hidden md:flex hover:bg-gray-100"
              >
                <Heart className="w-5 h-5" />
                <span className="sr-only">Wishlist</span>
              </Button>
              <Button
                onClick={() => navigate('/cart')}
                variant="ghost"
                size="icon"
                className="hover:bg-gray-100"
              >
                <ShoppingCart className="w-5 h-5" />
                <span className="sr-only">Cart</span>
              </Button>
            </div>

            {/* Mobile Search Button */}
            <Button variant="ghost" size="icon" className="md:hidden hover:bg-gray-100">
              <Search className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu - Slides from top */}
      <div
        className={`absolute top-0 left-0 right-0 bg-white border-b shadow-lg transform transition-transform duration-300 ease-in-out mobile-menu md:hidden ${
          isOpen ? 'translate-y-[calc(80%+1px)]' : '-translate-y-full'
        }`}
      >
        <nav className="px-4 py-6 space-y-4">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`block text-lg font-medium hover:text-gray-600 ${
                pathname === link.to ? 'text-black font-semibold' : ''
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  )
}

export { Navbar }
