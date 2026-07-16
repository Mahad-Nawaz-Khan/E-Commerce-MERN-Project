import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { poppins, inter } from '../../lib/fonts'

const categories = [
  "Woman's Fashion",
  "Men's Fashion",
  'Electronics',
  'Home & Lifestyle',
  'Medicine',
  'Sports & Outdoor',
  "Baby's & Toys",
  'Groceries & Pets',
  'Health & Beauty',
]

function HeroSection() {
  const [activeSlide, setActiveSlide] = useState(0)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <section className="max-w-292.5 mx-auto px-4 sm:px-6 lg:px-0 pt-6 sm:pt-10">
      <div className="grid grid-cols-1 lg:grid-cols-[195px_1fr] gap-0">
        {/* Categories Sidebar */}
        <div className="bg-white lg:border-r lg:border-[#e5e5e5] order-2 lg:order-1">
          <div className="flex lg:hidden justify-between items-center py-4 border-b">
            <h2 className="font-semibold">Categories</h2>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-500 hover:text-gray-700"
            >
              {isMobileMenuOpen ? 'Close' : 'Open'}
            </button>
          </div>
          <nav
            className={`space-y-1 py-4 lg:pr-4 ${
              isMobileMenuOpen ? 'block' : 'hidden lg:block'
            }`}
          >
            {categories.map((category, index) => (
              <Link
                key={category}
                to={`/shop?category=${encodeURIComponent(category)}`}
                className={`flex items-center justify-between text-sm hover:text-gray-600 py-2 px-4 lg:px-0 ${
                  ''
                }`}
              >
                {category}
                {index < 2 && <ChevronRight className="w-4 h-4" />}
              </Link>
            ))}
          </nav>
        </div>

        {/* Hero Banner */}
        <div className="relative bg-black text-white overflow-hidden order-1 lg:order-2 lg:ml-11">
          <div className="relative h-75 sm:h-90 lg:h-86">
            {/* Content */}
            <div className="absolute inset-0 flex flex-col justify-center p-8 md:p-12 lg:p-16">
              <div className="max-w-67.5 z-10">
                <h1
                  className={`${poppins.className} text-sm mb-5 flex items-center gap-2`}
                >
                  <img
                    src="/images/logos/apple.svg"
                    alt="Apple Logo"
                    width={24}
                    height={24}
                    className="mr-2"
                  />
                  <span>iPhone 14 Series</span>
                </h1>
                <p
                  className={`${inter.className} text-3xl sm:text-4xl lg:text-12 leading-[1.2] font-semibold tracking-[0.04em] mb-6 flex flex-col gap-1`}
                >
                  <span>Up to 10%</span>
                  <span>off Voucher</span>
                </p>
                <Link
                  to="/shop"
                  className={`${inter.className} inline-flex items-center gap-2 text-sm font-medium underline underline-offset-5`}
                >
                  Shop Now
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </div>

              {/* Product Image */}
              <div className="absolute right-0 bottom-0 w-[60%] h-[70%] sm:h-[80%] lg:w-[58%] lg:h-full">
                <img
                  src="/images/iphone.png"
                  alt="iPhone 14"
                  className="absolute inset-0 w-full h-full object-contain object-bottom-right"
                />
              </div>
            </div>
          </div>

          {/* Navigation Dots */}
          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {[0, 1, 2, 3, 4].map((index) => (
              <button
                key={index}
                onClick={() => setActiveSlide(index)}
                className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-colors ${
                  activeSlide === index ? 'bg-[#DB4444] ring-2 ring-white' : 'bg-[#808080]'
                }`}
              >
                <span className="sr-only">Slide {index + 1}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export { HeroSection }
