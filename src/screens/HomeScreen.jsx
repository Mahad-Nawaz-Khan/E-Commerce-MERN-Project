import { HeroSection } from '@/components/home/HeroSection'
import { FlashSales } from '@/components/home/FlashSales'
import { BrowseCategories } from '@/components/home/BrowseCategories'
import { BestSelling } from '@/components/home/BestSelling'
import { MusicPromo } from '@/components/home/MusicPromo'
import { ExploreProducts } from '@/components/home/ExploreProducts'
import { NewArrivals } from '@/components/home/NewArrivals'
import { ServiceFeatures } from '@/components/home/ServiceFeatures'

/** Home route — composes the 8 home sections in the same order as the original. */
function HomeScreen() {
  return (
    <div>
      <HeroSection />
      <FlashSales />
      <hr className="bg-black" />
      <BrowseCategories />
      <hr className="bg-black" />
      <BestSelling />
      <hr className="bg-black" />
      <MusicPromo />
      <ExploreProducts />
      <NewArrivals />
      <ServiceFeatures />
    </div>
  )
}

export { HomeScreen }
