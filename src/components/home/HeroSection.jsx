import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { poppins, inter } from '@/lib/fonts'

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-12">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Categories Sidebar */}
        <div className="bg-white lg:border-r order-2 lg:order-1 lg:col-span-1">
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
            className={`space-y-4 py-4 ${
              isMobileMenuOpen ? 'block' : 'hidden lg:block'
            }`}
          >
            {categories.map((category, index) => (
              <Link
                key={category}
                to="/"
                className={`flex items-center justify-between text-sm hover:text-gray-600 py-2 px-4 lg:px-0 ${
                  index < 2 ? 'font-semibold' : ''
                }`}
              >
                {category}
                {index < 2 && <ChevronRight className="w-4 h-4" />}
              </Link>
            ))}
          </nav>
        </div>

        {/* Hero Banner */}
        <div className="relative bg-black text-white rounded-lg overflow-hidden order-1 lg:order-2 lg:col-span-3">
          <div className="relative h-[300px] sm:h-[400px] lg:h-[500px]">
            {/* Content */}
            <div className="absolute inset-0 flex flex-col justify-center p-8 md:p-12">
              <div className="max-w-md z-10">
                <h1
                  className={`${poppins.className} text-xl sm:text-2xl mb-4 flex items-center gap-4`}
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
                  className={`${inter.className} text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 sm:mb-8 flex flex-col gap-2 sm:gap-3`}
                >
                  <span>Up to 10%</span>
                  <span>off Voucher</span>
                </p>
                <Link
                  to="/"
                  className={`${inter.className} inline-flex items-center text-sm font-semibold hover:underline`}
                >
                  Shop Now
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </div>

              {/* Product Image */}
              <div className="absolute right-0 bottom-0 w-[60%] h-[70%] sm:h-[80%] lg:h-full">
                <img
                  src="/images/iphone.png"
                  alt="iPhone 14"
                  className="absolute inset-0 w-full h-full object-contain object-right-bottom"
                />
              </div>
            </div>
          </div>

          {/* Navigation Dots */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {[0, 1, 2, 3, 4].map((index) => (
              <button
                key={index}
                onClick={() => setActiveSlide(index)}
                className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-colors ${
                  activeSlide === index ? 'bg-white' : 'bg-gray-400/50'
                }`}
              >
                <span className="sr-only">Slide {index + 1}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export { HeroSection }
