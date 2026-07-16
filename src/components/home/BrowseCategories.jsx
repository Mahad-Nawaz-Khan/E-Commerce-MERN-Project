import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ChevronLeft,
  ChevronRight,
  Smartphone,
  Monitor,
  Watch,
  Camera,
  Headphones,
  Gamepad,
} from 'lucide-react'
import { Button } from '../ui/Button'

const categories = [
  { name: 'Phones', icon: Smartphone, active: false },
  { name: 'Computers', icon: Monitor, active: false },
  { name: 'SmartWatch', icon: Watch, active: false },
  { name: 'Camera', icon: Camera, active: true },
  { name: 'HeadPhones', icon: Headphones, active: false },
  { name: 'Gaming', icon: Gamepad, active: false },
]

function BrowseCategories() {
  const [offset, setOffset] = useState(0)
  const visibleCategories = [...categories.slice(offset), ...categories.slice(0, offset)]
  return (
    <section className="max-w-292.5 mx-auto px-4 sm:px-6 lg:px-0 py-12 sm:py-16">
      <div className="flex flex-col gap-7">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 sm:w-5 h-8 sm:h-10 bg-[#DB4444] rounded-sm" />
              <span className="text-[#DB4444] text-sm sm:text-base font-semibold">
                Categories
              </span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-semibold tracking-[0.04em]">Browse By Category</h2>
          </div>
          <div className="flex gap-2 sm:gap-4">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 sm:h-10 sm:w-10 rounded-full border-0 bg-[#f5f5f5]"
              onClick={() => setOffset((value) => (value - 1 + categories.length) % categories.length)}
            >
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 sm:h-10 sm:w-10 rounded-full border-0 bg-[#f5f5f5]"
              onClick={() => setOffset((value) => (value + 1) % categories.length)}
            >
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-7.5">
          {visibleCategories.map((category) => {
            const Icon = category.icon
            return (
              <Link
                key={category.name}
                to={`/shop?category=${encodeURIComponent(category.name)}`}
                className={`flex min-h-36.25 flex-col items-center justify-center p-5 border rounded-sm hover:bg-[#DB4444] hover:text-white transition-colors cursor-pointer group ${
                  category.active ? 'bg-[#DB4444] text-white' : ''
                }`}
              >
                <Icon
                  className={`w-8 h-8 sm:w-10 sm:h-10 mb-2 sm:mb-4 ${
                    category.active ? 'stroke-white' : 'stroke-black group-hover:stroke-white'
                  }`}
                />
                <span className="text-sm sm:text-base font-medium text-center">
                  {category.name}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export { BrowseCategories }
