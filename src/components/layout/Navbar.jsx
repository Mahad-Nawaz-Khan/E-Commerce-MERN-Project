import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Heart, Search, ShoppingCart, Menu, X } from 'lucide-react'
import { Select } from 'antd'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { useCart } from '../../hooks/useCart'
import { useWishlist } from '../../hooks/useWishlist'

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
  const [searchTerm, setSearchTerm] = useState('')
  const cart = useCart()
  const wishlist = useWishlist()

  const submitSearch = (event) => {
    event.preventDefault()
    const query = searchTerm.trim()
    if (query) navigate(`/shop?search=${encodeURIComponent(query)}`)
  }

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
      <div className="w-full bg-black text-white h-12 px-4 flex justify-between items-center text-xs">
        <p className="text-center flex-1 font-medium">
          Summer Sale For All Swim Suits And Free Express Delivery - OFF 50%!
          <Link to="/" className="ml-2 underline">
            ShopNow
          </Link>
        </p>
        <Select
          defaultValue="English"
          variant="borderless"
          size="small"
          options={['English', 'Spanish', 'French'].map((language) => ({ value: language, label: language }))}
          className="w-19.5 [&_.ant-select-selector]:bg-black! [&_.ant-select-selector]:text-white! [&_.ant-select-selection-item]:text-white! [&_.ant-select-arrow]:text-white!"
          popupClassName="exclusive-language-menu"
        />
      </div>

      {/* Main Navigation */}
      <div className="border-b border-[#e5e5e5]">
        <div className="max-w-292.5 mx-auto px-4 sm:px-6 lg:px-0">
          <div className="flex items-center justify-between h-20">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="inline-flex! md:hidden! menu-trigger"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              <span className="sr-only">Toggle menu</span>
            </Button>

            {/* Logo */}
            <Link to="/" className="text-2xl font-bold tracking-tight">
              Exclusive
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-11">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`text-sm font-normal transition-colors hover:text-gray-600 ${
                    pathname === link.to ? 'text-black underline underline-offset-5' : ''
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Search and Icons */}
            <div className="flex items-center space-x-4">
              <form onSubmit={submitSearch} className="hidden md:flex items-center max-w-xs w-full relative">
                <Input
                  type="search"
                  placeholder="What are you looking for?"
                  className="w-61.25 h-9 pr-8 bg-[#f5f5f5] border-0 rounded-sm focus:bg-white transition-colors text-xs"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
                <button type="submit" aria-label="Search products" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black">
                  <Search className="w-4 h-4" />
                </button>
              </form>
              <Button
                onClick={() => navigate('/wishlist')}
                variant="ghost"
                size="icon"
                className="relative hidden md:flex hover:bg-gray-100"
              >
                <Heart className="w-5 h-5" />
                {wishlist.count > 0 && <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-[#DB4444] px-1 text-2.5 text-white">{wishlist.count}</span>}
                <span className="sr-only">Wishlist</span>
              </Button>
              <Button
                onClick={() => navigate('/cart')}
                variant="ghost"
                size="icon"
                className="relative hover:bg-gray-100"
              >
                <ShoppingCart className="w-5 h-5" />
                {cart.totalItems > 0 && <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-[#DB4444] px-1 text-2.5 text-white">{cart.totalItems}</span>}
                <span className="sr-only">Cart</span>
              </Button>
            </div>

            {/* Mobile Search Button */}
            <Button variant="ghost" size="icon" className="inline-flex! md:hidden! hover:bg-gray-100" onClick={() => navigate('/shop')}>
              <Search className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu - Slides from top */}
      <div
        className={`absolute top-0 left-0 right-0 bg-white border-b shadow-lg transform transition-transform duration-300 ease-in-out mobile-menu md:hidden ${
          isOpen ? 'translate-y-[calc(100%+1px)]' : '-translate-y-full'
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
