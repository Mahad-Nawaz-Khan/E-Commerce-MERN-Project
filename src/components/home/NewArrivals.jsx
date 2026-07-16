import { Link } from 'react-router-dom'
import { Button } from '../ui/Button'

/**
 * New Arrival featured grid — 4 promo cards (PlayStation 5 large, Women's
 * Collections, Speakers, Perfume) over dark images with hover-zoom and an
 * overlay "Shop Now" underline button.
 */
function ArrivalsCard({ image, alt, title, description, className }) {
  return (
    <div className={`${className} relative rounded-sm overflow-hidden group bg-black`}>
      <img
        src={image}
        alt={alt}
        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 transform transition-transform duration-500 ease-out translate-y-2 group-hover:translate-y-0">
        <h3 className="text-xl sm:text-6 font-semibold text-white mb-2 tracking-tight">{title}</h3>
        <p className="max-w-61.25 text-white/90 text-xs sm:text-sm mb-3 font-medium">{description}</p>
        <Link to="/shop">
          <Button
            variant="ghost"
            className="h-8 px-0 text-white hover:text-white hover:bg-transparent p-0 font-medium relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-white after:transition-all after:duration-300 hover:after:w-full"
          >
            Shop Now
          </Button>
        </Link>
      </div>
    </div>
  )
}

function NewArrivals() {
  return (
    <section className="w-full max-w-292.5 mx-auto px-4 sm:px-6 lg:px-0 py-12 sm:py-16">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-1.25 h-10 bg-[#DB4444]" />
        <span className="text-[#DB4444] text-base font-semibold tracking-tight">Featured</span>
      </div>

      <h2 className="text-2xl sm:text-4xl font-semibold mb-10 tracking-[0.04em]">New Arrival</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-7.5">
        <ArrivalsCard
          image="/images/ps5.png"
          alt="PlayStation 5"
          title="PlayStation 5"
          description="Black and White version of the PS5 coming out on sale."
          className="lg:col-span-6 lg:row-span-2 h-75 md:h-150"
        />
        <ArrivalsCard
          image="/images/women.png"
          alt="Women's Collections"
          title="Women's Collections"
          description="Featured women collections that give you another vibe."
          className="lg:col-span-6 h-71"
        />
        <ArrivalsCard
          image="/images/speakers.png"
          alt="Speakers"
          title="Speakers"
          description="Amazon wireless speakers"
          className="lg:col-span-3 h-71"
        />
        <ArrivalsCard
          image="/images/perfume.png"
          alt="Perfume"
          title="Perfume"
          description="GUCCI INTENSE OUD EDP"
          className="lg:col-span-3 h-71"
        />
      </div>
    </section>
  )
}

export { NewArrivals }
