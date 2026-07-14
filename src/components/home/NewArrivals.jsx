import { Button } from '@/components/ui/Button'

/**
 * New Arrival featured grid — 4 promo cards (PlayStation 5 large, Women's
 * Collections, Speakers, Perfume) over dark images with hover-zoom and an
 * overlay "Shop Now" underline button. Static content (matches the original).
 *
 * The shared overlay/button markup is factored into a small ArrivalsCard to
 * avoid repeating the gradient + animated-button markup four times.
 */
function ArrivalsCard({ image, alt, title, description, className }) {
  return (
    <div className={`${className} relative rounded-[4px] overflow-hidden group bg-black`}>
      <img
        src={image}
        alt={alt}
        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-8 transform transition-transform duration-500 ease-out translate-y-2 group-hover:translate-y-0">
        <h3 className="text-[24px] font-semibold text-white mb-3 tracking-tight">{title}</h3>
        <p className="text-white/90 text-sm mb-6 font-medium">{description}</p>
        <Button
          variant="ghost"
          className="h-8 px-0 text-white hover:text-white hover:bg-transparent p-0 font-medium relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-white after:transition-all after:duration-300 hover:after:w-full"
        >
          Shop Now
        </Button>
      </div>
    </div>
  )
}

function NewArrivals() {
  return (
    <section className="w-full max-w-[1170px] mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-[5px] h-[40px] bg-[#DB4444]" />
        <span className="text-[#DB4444] text-base font-semibold tracking-tight">Featured</span>
      </div>

      <h2 className="text-[36px] font-medium mb-10 tracking-tight">New Arrival</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-[30px]">
        <ArrivalsCard
          image="/images/ps5.png"
          alt="PlayStation 5"
          title="PlayStation 5"
          description="Black and White version of the PS5 coming out on sale."
          className="lg:col-span-6 lg:row-span-2 h-[300px] md:h-[600px]"
        />
        <ArrivalsCard
          image="/images/women.png"
          alt="Women's Collections"
          title="Women's Collections"
          description="Featured women collections that give you another vibe."
          className="lg:col-span-6 h-[284px]"
        />
        <ArrivalsCard
          image="/images/speakers.png"
          alt="Speakers"
          title="Speakers"
          description="Amazon wireless speakers"
          className="lg:col-span-3 h-[284px]"
        />
        <ArrivalsCard
          image="/images/perfume.png"
          alt="Perfume"
          title="Perfume"
          description="GUCCI INTENSE OUD EDP"
          className="lg:col-span-3 h-[284px]"
        />
      </div>
    </section>
  )
}

export { NewArrivals }
